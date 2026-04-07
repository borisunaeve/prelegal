"use client";

import { NdaFormValues } from "@/lib/nda-types";

interface Props {
  values: NdaFormValues;
}

const FILLED = { color: "#1a1814", fontStyle: "normal" as const };
const EMPTY = { color: "#aaa8a0", fontStyle: "italic" as const };

function field(value: string, placeholder: string) {
  const style = value.trim() ? FILLED : EMPTY;
  return <span style={style}>{value.trim() || `[${placeholder}]`}</span>;
}

function formatDate(iso: string) {
  if (!iso) return <span style={EMPTY}>[Date]</span>;
  const d = new Date(iso + "T00:00:00");
  return (
    <span style={FILLED}>
      {d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
    </span>
  );
}

function mndaTermText(v: NdaFormValues) {
  if (v.mndaTermType === "perpetual") return "Continues until terminated in accordance with the terms of the MNDA.";
  return `Expires ${v.mndaTermYears || "1"} year(s) from Effective Date.`;
}

function confTermText(v: NdaFormValues) {
  if (v.confidentialityTermType === "perpetual") return "In perpetuity.";
  return `${v.confidentialityTermYears || "1"} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`;
}

// Inline reference highlight used in Standard Terms
function Ref({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        borderBottom: "1.5px solid #c9a84c",
        paddingBottom: 1,
        color: "#1a1814",
      }}
    >
      {children}
    </span>
  );
}

export function NdaPreview({ values: v }: Props) {
  const gl = v.governingLaw || "Fill in state";
  const jur = v.jurisdiction || "Fill in jurisdiction";

  return (
    <div
      className="nda-document"
      style={{
        fontFamily: "var(--font-document)",
        fontSize: "0.9rem",
        lineHeight: 1.75,
        color: "#1a1814",
      }}
    >
      {/* ══ COVER PAGE ══════════════════════════════════════════ */}
      <div style={{ marginBottom: "3rem" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: "#0f0d09",
              marginBottom: "0.4rem",
            }}
          >
            Mutual Non-Disclosure Agreement
          </h1>
          <div
            style={{
              width: 48,
              height: 2,
              background: "#c9a84c",
              margin: "0 auto 0.6rem",
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#888",
            }}
          >
            Common Paper Standard · Version 1.0
          </p>
        </div>

        {/* Usage note */}
        <div
          style={{
            borderLeft: "3px solid #c9a84c",
            paddingLeft: "1rem",
            marginBottom: "2rem",
            fontSize: "0.78rem",
            color: "#666",
            lineHeight: 1.65,
          }}
        >
          This MNDA consists of: (1) this Cover Page and (2) the Common Paper Mutual NDA Standard Terms
          Version 1.0 identical to those posted at{" "}
          <a href="https://commonpaper.com/standards/mutual-nda/1.0" target="_blank" rel="noreferrer" style={{ color: "#c9a84c" }}>
            commonpaper.com/standards/mutual-nda/1.0
          </a>. Any modifications of the Standard Terms should be made on the Cover Page.
        </div>

        {/* Cover page fields table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", marginBottom: "2rem" }}>
          <tbody>
            <CoverRow label="Purpose" sub="How Confidential Information may be used">
              {field(v.purpose, "Purpose of disclosure")}
            </CoverRow>
            <CoverRow label="Effective Date">
              {formatDate(v.effectiveDate)}
            </CoverRow>
            <CoverRow label="MNDA Term" sub="The length of this MNDA">
              {mndaTermText(v)}
            </CoverRow>
            <CoverRow label="Term of Confidentiality" sub="How long information is protected">
              {confTermText(v)}
            </CoverRow>
            <CoverRow label="Governing Law & Jurisdiction">
              <div>Governing Law: {field(v.governingLaw, "State")}</div>
              <div style={{ marginTop: "0.25rem" }}>Jurisdiction: {field(v.jurisdiction, "City, State")}</div>
            </CoverRow>
            <CoverRow label="MNDA Modifications">
              <span style={{ color: "#aaa8a0", fontStyle: "italic" }}>None.</span>
            </CoverRow>
          </tbody>
        </table>

        <p style={{ fontSize: "0.82rem", marginBottom: "1.5rem", color: "#444" }}>
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
        </p>

        {/* Signature block */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", border: "1px solid #d0cec8" }}>
          <thead>
            <tr style={{ background: "#f4f0e8" }}>
              <th style={{ border: "1px solid #d0cec8", padding: "0.6rem 0.75rem", textAlign: "left", fontWeight: 600, width: "28%", fontFamily: "var(--font-ui)", fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase" }}></th>
              <th style={{ border: "1px solid #d0cec8", padding: "0.6rem 0.75rem", textAlign: "center", fontWeight: 600, fontFamily: "var(--font-ui)", fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Party 1</th>
              <th style={{ border: "1px solid #d0cec8", padding: "0.6rem 0.75rem", textAlign: "center", fontWeight: 600, fontFamily: "var(--font-ui)", fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Party 2</th>
            </tr>
          </thead>
          <tbody>
            <SigRow label="Signature">
              <div style={{ height: 36 }} />
              <div style={{ height: 36 }} />
            </SigRow>
            <SigRow label="Print Name">
              {field(v.party1Name, "Name")}
              {field(v.party2Name, "Name")}
            </SigRow>
            <SigRow label="Title">
              {field(v.party1Title, "Title")}
              {field(v.party2Title, "Title")}
            </SigRow>
            <SigRow label="Company">
              {field(v.party1Company, "Company")}
              {field(v.party2Company, "Company")}
            </SigRow>
            <SigRow label="Notice Address">
              {field(v.party1Address, "Email or address")}
              {field(v.party2Address, "Email or address")}
            </SigRow>
            <SigRow label="Date">
              <div style={{ height: 24 }} />
              <div style={{ height: 24 }} />
            </SigRow>
          </tbody>
        </table>

        <p style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "1rem", fontFamily: "var(--font-ui)" }}>
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" style={{ color: "#c9a84c" }}>CC BY 4.0</a>.
        </p>
      </div>

      {/* Page break divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          margin: "3rem 0",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "#e0ddd6" }} />
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#bbb",
          }}
        >
          Standard Terms
        </span>
        <div style={{ flex: 1, height: 1, background: "#e0ddd6" }} />
      </div>

      {/* ══ STANDARD TERMS ══════════════════════════════════════ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        <Clause n={1} title="Introduction">
          This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page)
          (&ldquo;<strong>MNDA</strong>&rdquo;) allows each party (&ldquo;<strong>Disclosing Party</strong>&rdquo;) to disclose
          or make available information in connection with the <Ref>{field(v.purpose, "Purpose")}</Ref> which
          (1) the Disclosing Party identifies to the receiving party (&ldquo;<strong>Receiving Party</strong>&rdquo;) as
          &ldquo;confidential&rdquo;, &ldquo;proprietary&rdquo;, or the like or (2) should be reasonably understood as
          confidential or proprietary due to its nature and the circumstances of its disclosure
          (&ldquo;<strong>Confidential Information</strong>&rdquo;). Each party&rsquo;s Confidential Information also
          includes the existence and status of the parties&rsquo; discussions and information on the Cover Page.
          Confidential Information includes technical or business information, product designs or roadmaps, requirements,
          pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the
          parties must complete and sign a cover page incorporating these Standard Terms (&ldquo;<strong>Cover
          Page</strong>&rdquo;). Each party is identified on the Cover Page and capitalized terms have the meanings given
          herein or on the Cover Page.
        </Clause>

        <Clause n={2} title="Use and Protection of Confidential Information">
          The Receiving Party shall: (a) use Confidential Information solely for the{" "}
          <Ref>{field(v.purpose, "Purpose")}</Ref>; (b) not disclose Confidential Information to third parties
          without the Disclosing Party&rsquo;s prior written approval, except that the Receiving Party may
          disclose Confidential Information to its employees, agents, advisors, contractors and other
          representatives having a reasonable need to know for the <Ref>{field(v.purpose, "Purpose")}</Ref>,
          provided these representatives are bound by confidentiality obligations no less protective of the
          Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible
          for their compliance with this MNDA; and (c) protect Confidential Information using at least the same
          protections the Receiving Party uses for its own similar information but no less than a reasonable
          standard of care.
        </Clause>

        <Clause n={3} title="Exceptions">
          The Receiving Party&rsquo;s obligations in this MNDA do not apply to information that it can
          demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it
          rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality
          restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or
          (d) it independently developed without using or referencing the Confidential Information.
        </Clause>

        <Clause n={4} title="Disclosures Required by Law">
          The Receiving Party may disclose Confidential Information to the extent required by law, regulation or
          regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides
          the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates,
          at the Disclosing Party&rsquo;s expense, with the Disclosing Party&rsquo;s efforts to obtain
          confidential treatment for the Confidential Information.
        </Clause>

        <Clause n={5} title="Term and Termination">
          This MNDA commences on the <Ref>{formatDate(v.effectiveDate)}</Ref> and expires at the end of the{" "}
          <Ref>{mndaTermText(v)}</Ref> Either party may terminate this MNDA for any or no reason upon written
          notice to the other party. The Receiving Party&rsquo;s obligations relating to Confidential
          Information will survive for the <Ref>{confTermText(v)}</Ref>, despite any expiration or termination
          of this MNDA.
        </Clause>

        <Clause n={6} title="Return or Destruction of Confidential Information">
          Upon expiration or termination of this MNDA or upon the Disclosing Party&rsquo;s earlier request,
          the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing
          Party&rsquo;s written request, destroy all Confidential Information in the Receiving Party&rsquo;s
          possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing
          Party, confirm its compliance with these obligations in writing. As an exception to subsection (b),
          the Receiving Party may retain Confidential Information in accordance with its standard backup or
          record retention policies or as required by law, but the terms of this MNDA will continue to apply
          to the retained Confidential Information.
        </Clause>

        <Clause n={7} title="Proprietary Rights">
          The Disclosing Party retains all of its intellectual property and other rights in its Confidential
          Information and its disclosure to the Receiving Party grants no license under such rights.
        </Clause>

        <Clause n={8} title="Disclaimer">
          ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS IS&rdquo;, WITH ALL FAULTS, AND WITHOUT
          WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR
          PURPOSE.
        </Clause>

        <Clause n={9} title="Governing Law and Jurisdiction">
          This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws
          of the State of <Ref>{field(v.governingLaw, gl)}</Ref>, without regard to the conflict of laws
          provisions of such <Ref>{field(v.governingLaw, gl)}</Ref>. Any legal suit, action, or proceeding
          relating to this MNDA must be instituted in the federal or state courts located in{" "}
          <Ref>{field(v.jurisdiction, jur)}</Ref>. Each party irrevocably submits to the exclusive jurisdiction
          of such <Ref>{field(v.jurisdiction, jur)}</Ref> in any such suit, action, or proceeding.
        </Clause>

        <Clause n={10} title="Equitable Relief">
          A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient
          remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable
          relief, including an injunction, in addition to its other remedies.
        </Clause>

        <Clause n={11} title="General">
          Neither party has an obligation under this MNDA to disclose Confidential Information to the other or
          proceed with any proposed transaction. Neither party may assign this MNDA without the prior written
          consent of the other party, except that either party may assign this MNDA in connection with a merger,
          reorganization, acquisition or other transfer of all or substantially all its assets or voting
          securities. Any assignment in violation of this Section is null and void. This MNDA will bind and
          inure to the benefit of each party&rsquo;s permitted successors and assigns. Waivers must be signed
          by the waiving party&rsquo;s authorized representative and cannot be implied from conduct. If any
          provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so
          the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire
          agreement of the parties with respect to its subject matter, and supersedes all prior and
          contemporaneous understandings, agreements, representations, and warranties, whether written or oral,
          regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an
          agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be
          sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt.
          This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an
          original and which together form the same agreement.
        </Clause>

        <p style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "1rem", fontFamily: "var(--font-ui)" }}>
          Common Paper Mutual Non-Disclosure Agreement{" "}
          <a href="https://commonpaper.com/standards/mutual-nda/1.0/" target="_blank" rel="noreferrer" style={{ color: "#c9a84c" }}>
            Version 1.0
          </a>{" "}
          free to use under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" style={{ color: "#c9a84c" }}>
            CC BY 4.0
          </a>.
        </p>
      </div>
    </div>
  );
}

function CoverRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: "1px solid #e8e4da", verticalAlign: "top" }}>
      <td
        style={{
          padding: "0.75rem 1rem 0.75rem 0",
          width: "34%",
          fontFamily: "var(--font-ui)",
          fontWeight: 600,
          fontSize: "0.78rem",
          color: "#2a2820",
          verticalAlign: "top",
        }}
      >
        {label}
        {sub && (
          <div style={{ fontWeight: 400, fontSize: "0.68rem", color: "#999", marginTop: 2 }}>{sub}</div>
        )}
      </td>
      <td style={{ padding: "0.75rem 0" }}>{children}</td>
    </tr>
  );
}

function SigRow({ label, children }: { label: string; children: React.ReactNode }) {
  const [c1, c2] = Array.isArray(children) ? children : [children, null];
  return (
    <tr style={{ borderBottom: "1px solid #d0cec8", verticalAlign: "top" }}>
      <td
        style={{
          border: "1px solid #d0cec8",
          padding: "0.55rem 0.75rem",
          fontFamily: "var(--font-ui)",
          fontWeight: 500,
          fontSize: "0.72rem",
          color: "#555",
          verticalAlign: "middle",
        }}
      >
        {label}
      </td>
      <td style={{ border: "1px solid #d0cec8", padding: "0.55rem 0.75rem", minHeight: 32 }}>{c1}</td>
      <td style={{ border: "1px solid #d0cec8", padding: "0.55rem 0.75rem", minHeight: 32 }}>{c2}</td>
    </tr>
  );
}

function Clause({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <p style={{ textAlign: "justify" }}>
      <strong style={{ fontFamily: "var(--font-document)" }}>
        {n}. {title}.
      </strong>{" "}
      {children}
    </p>
  );
}
