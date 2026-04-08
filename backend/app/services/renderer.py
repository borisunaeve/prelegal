"""
Render a Common Paper markdown template to HTML.

The templates use:
  <span class="coverpage_link">Term</span>
  <span class="keyterms_link">Term</span>
  <span class="orderform_link">Term</span>
  <span class="businessterms_link">Term</span>
  <span class="sow_link">Term</span>
  <span class="header_2" ...>...</span>
  <span class="header_3" ...>...</span>

We convert markdown → HTML and style the link spans as gold-underlined references.
"""
import re
from html.parser import HTMLParser
from pathlib import Path

TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates"

# Span classes that indicate defined-term references
_LINK_CLASSES = {
    "coverpage_link",
    "keyterms_link",
    "orderform_link",
    "businessterms_link",
    "sow_link",
}

_LINK_STYLE = (
    'border-bottom:1.5px solid #c9a84c;'
    'padding-bottom:1px;'
    'color:#1a1814;'
)

_H2_STYLE = (
    'font-family:var(--font-display,serif);'
    'font-size:1.05rem;'
    'font-weight:600;'
    'color:#0f0d09;'
    'margin:1.5rem 0 0.5rem;'
)

_H3_STYLE = (
    'font-family:var(--font-display,serif);'
    'font-size:0.95rem;'
    'font-weight:600;'
    'color:#0f0d09;'
    'margin:1rem 0 0.25rem;'
)


class _SpanRestyler(HTMLParser):
    """Walk the HTML stream and restyle Common Paper <span> elements in-place.
    Using a proper parser avoids the nested-span problem with regex."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self._buf: list[str] = []
        self._span_stack: list[str] = []  # pending replacement styles

    def handle_starttag(self, tag: str, attrs: list[tuple]) -> None:
        if tag == "span":
            cls = dict(attrs).get("class", "")
            if cls in _LINK_CLASSES:
                self._buf.append(f'<span style="{_LINK_STYLE}">')
                self._span_stack.append("styled")
            elif cls == "header_2":
                self._buf.append(f'<span style="{_H2_STYLE}">')
                self._span_stack.append("styled")
            elif cls == "header_3":
                self._buf.append(f'<span style="{_H3_STYLE}">')
                self._span_stack.append("styled")
            else:
                # Unknown span — emit nothing; endtag will skip too
                self._span_stack.append("skip")
        else:
            attr_str = "".join(
                f' {k}="{v}"' if v is not None else f' {k}'
                for k, v in attrs
            )
            self._buf.append(f"<{tag}{attr_str}>")

    def handle_endtag(self, tag: str) -> None:
        if tag == "span":
            kind = self._span_stack.pop() if self._span_stack else "styled"
            if kind == "styled":
                self._buf.append("</span>")
            # "skip" → emit nothing
        else:
            self._buf.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self._buf.append(data)

    def handle_entityref(self, name: str) -> None:
        self._buf.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self._buf.append(f"&#{name};")

    def result(self) -> str:
        return "".join(self._buf)


def _restyle_spans(html: str) -> str:
    """Replace Common Paper span elements with styled equivalents using a proper HTML parser."""
    parser = _SpanRestyler()
    parser.feed(html)
    return parser.result()


def _md_to_html(md: str) -> str:
    """Very lightweight markdown → HTML (no external library needed for these templates)."""
    lines = md.split("\n")
    out: list[str] = []
    in_table = False
    in_list = False
    in_para = False

    def close_para():
        nonlocal in_para
        if in_para:
            out.append("</p>")
            in_para = False

    def close_list():
        nonlocal in_list
        if in_list:
            out.append("</ul>")
            in_list = False

    def close_table():
        nonlocal in_table
        if in_table:
            out.append("</tbody></table>")
            in_table = False

    def inline(text: str) -> str:
        """Apply inline markdown: bold, italic, links."""
        # **bold**
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        # *italic*
        text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
        # [text](url)
        text = re.sub(
            r'\[([^\]]+)\]\(([^)]+)\)',
            r'<a href="\2" target="_blank" rel="noreferrer" style="color:#c9a84c">\1</a>',
            text,
        )
        return text

    for raw_line in lines:
        line = raw_line.rstrip()

        # Blank line
        if not line.strip():
            close_para()
            close_list()
            close_table()
            continue

        # Headings
        if line.startswith("#### "):
            close_para(); close_list(); close_table()
            out.append(f'<h4 style="font-family:var(--font-display,serif);font-size:0.85rem;font-weight:600;color:#0f0d09;margin:0.75rem 0 0.2rem">{inline(line[5:])}</h4>')
            continue
        if line.startswith("### "):
            close_para(); close_list(); close_table()
            out.append(f'<h3 style="{_H3_STYLE}">{inline(line[4:])}</h3>')
            continue
        if line.startswith("## "):
            close_para(); close_list(); close_table()
            out.append(f'<h2 style="{_H2_STYLE}">{inline(line[3:])}</h2>')
            continue
        if line.startswith("# "):
            close_para(); close_list(); close_table()
            out.append(f'<h1 style="font-family:var(--font-display,serif);font-size:1.4rem;font-weight:400;color:#0f0d09;margin:0 0 1rem;text-align:center">{inline(line[2:])}</h1>')
            continue

        # Horizontal rule
        if re.match(r'^-{3,}$', line):
            close_para(); close_list(); close_table()
            out.append('<hr style="border:none;border-top:1px solid #e8e4da;margin:1.5rem 0">')
            continue

        # Table rows (markdown table)
        if line.startswith("|"):
            close_para(); close_list()
            # Separator row
            if re.match(r'^\|[\s\-:|]+\|', line):
                continue
            cells = [c.strip() for c in line.strip("|").split("|")]
            if not in_table:
                out.append('<table style="width:100%;border-collapse:collapse;font-size:0.85rem;margin:1rem 0"><tbody>')
                in_table = True
            td_style = 'border:1px solid #e8e4da;padding:0.5rem 0.75rem;vertical-align:top'
            row = "".join(f'<td style="{td_style}">{inline(c)}</td>' for c in cells)
            out.append(f"<tr>{row}</tr>")
            continue

        close_table()

        # Checkbox list items: - [x] or - [ ]
        if re.match(r'^- \[[ xX]\]', line):
            checked = line[3] in ('x', 'X')
            text = inline(line[6:].strip())
            if not in_list:
                out.append('<ul style="list-style:none;padding:0;margin:0.5rem 0">')
                in_list = True
            symbol = "☑" if checked else "☐"
            out.append(f'<li style="margin:0.25rem 0">{symbol} {text}</li>')
            continue

        # Ordered list items: 1. or 1.1.
        if re.match(r'^\d+[\.\d]*\s', line):
            close_list()
            close_para()
            indent = len(line) - len(line.lstrip())
            margin = f"margin-left:{indent * 0.5}rem"
            out.append(f'<p style="text-align:justify;margin:0.4rem 0;{margin}">{inline(line.strip())}</p>')
            continue

        # Unordered list
        if line.startswith("- ") or line.startswith("* "):
            if not in_list:
                out.append('<ul style="padding-left:1.25rem;margin:0.5rem 0">')
                in_list = True
            out.append(f'<li style="margin:0.2rem 0">{inline(line[2:])}</li>')
            continue

        close_list()

        # Regular paragraph / continuation
        if not in_para:
            out.append('<p style="text-align:justify;margin:0.5rem 0;line-height:1.7">')
            in_para = True
        else:
            out.append(" ")
        out.append(inline(line))

    close_para()
    close_list()
    close_table()

    return "\n".join(out)


def render_template(filename: str, values: dict) -> str:
    """
    Load a template, build an HTML cover sheet from field values,
    then render the template body as HTML.
    Returns a full HTML fragment (no <html>/<body> wrapper).
    """
    path = TEMPLATES_DIR / filename
    md = path.read_text(encoding="utf-8")

    # Render template body
    body_html = _md_to_html(md)
    body_html = _restyle_spans(body_html)

    # Build a cover sheet table from non-empty values
    cover_rows = ""
    for key, val in values.items():
        if val and str(val).strip():
            label = re.sub(r'([A-Z])', r' \1', key).strip().title()
            cover_rows += (
                f'<tr>'
                f'<td style="padding:0.5rem 0.75rem;font-weight:600;font-family:var(--font-ui,sans-serif);'
                f'font-size:0.78rem;color:#2a2820;white-space:nowrap;border-bottom:1px solid #e8e4da;width:34%">'
                f'{label}</td>'
                f'<td style="padding:0.5rem 0;border-bottom:1px solid #e8e4da">{val}</td>'
                f'</tr>'
            )

    cover_html = ""
    if cover_rows:
        cover_html = (
            '<div style="margin-bottom:2.5rem">'
            '<p style="font-family:var(--font-ui,sans-serif);font-size:0.65rem;font-weight:600;'
            'letter-spacing:0.1em;text-transform:uppercase;color:#c9a84c;margin-bottom:0.75rem">'
            '— Key Terms —</p>'
            f'<table style="width:100%;border-collapse:collapse;font-size:0.85rem">'
            f'<tbody>{cover_rows}</tbody></table>'
            '</div>'
            '<hr style="border:none;border-top:2px solid #e8e4da;margin:2rem 0">'
        )

    return cover_html + body_html
