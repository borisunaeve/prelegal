"use client";

import { NdaFormValues } from "@/lib/nda-types";

interface Props {
  values: NdaFormValues;
}

function field(value: string, placeholder: string) {
  return value.trim() ? (
    <span className="font-medium text-foreground">{value}</span>
  ) : (
    <span className="italic text-muted-foreground">[{placeholder}]</span>
  );
}

function formatDate(iso: string) {
  if (!iso) return "[Date]";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function mndaTermText(values: NdaFormValues) {
  if (values.mndaTermType === "perpetual") return "Continues until terminated in accordance with the terms of the MNDA.";
  return `Expires ${values.mndaTermYears || "1"} year(s) from Effective Date.`;
}

function confTermText(values: NdaFormValues) {
  if (values.confidentialityTermType === "perpetual") return "In perpetuity.";
  return `${values.confidentialityTermYears || "1"} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`;
}

export function NdaPreview({ values }: Props) {
  const p = (v: string, ph: string) => field(v, ph);
  const gl = values.governingLaw || "Fill in state";
  const jur = values.jurisdiction || "Fill in city or county and state";

  return (
    <div className="nda-document font-serif text-[15px] leading-relaxed text-foreground space-y-8">

      {/* ── Cover Page ── */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Mutual Non-Disclosure Agreement</h1>
          <p className="text-sm text-muted-foreground">Common Paper Standard — Version 1.0</p>
        </div>

        <p className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
          This Mutual Non-Disclosure Agreement (the &ldquo;MNDA&rdquo;) consists of: (1) this Cover Page
          and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 identical to those posted at{" "}
          <a href="https://commonpaper.com/standards/mutual-nda/1.0" className="underline" target="_blank" rel="noreferrer">
            commonpaper.com/standards/mutual-nda/1.0
          </a>. Any modifications of the Standard Terms should be made on the Cover Page, which will
          control over conflicts with the Standard Terms.
        </p>

        <table className="w-full text-sm border-collapse">
          <tbody>
            <CoverRow label="Purpose" sublabel="How Confidential Information may be used">
              {p(values.purpose, "Purpose of disclosure")}
            </CoverRow>
            <CoverRow label="Effective Date">
              {formatDate(values.effectiveDate)}
            </CoverRow>
            <CoverRow label="MNDA Term" sublabel="The length of this MNDA">
              {mndaTermText(values)}
            </CoverRow>
            <CoverRow label="Term of Confidentiality" sublabel="How long Confidential Information is protected">
              {confTermText(values)}
            </CoverRow>
            <CoverRow label="Governing Law &amp; Jurisdiction">
              <div>Governing Law: {p(values.governingLaw, "State")}</div>
              <div>Jurisdiction: {p(values.jurisdiction, "City or county and state")}</div>
            </CoverRow>
            <CoverRow label="MNDA Modifications">
              <span className="italic text-muted-foreground">None.</span>
            </CoverRow>
          </tbody>
        </table>

        <p className="text-sm">
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
        </p>

        {/* Signature table */}
        <table className="w-full text-sm border-collapse border border-border">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border p-2 text-left w-1/3"></th>
              <th className="border border-border p-2 text-center">Party 1</th>
              <th className="border border-border p-2 text-center">Party 2</th>
            </tr>
          </thead>
          <tbody>
            <SignatureRow label="Signature">
              <span className="h-8 block" />
              <span className="h-8 block" />
            </SignatureRow>
            <SignatureRow label="Print Name">
              {p(values.party1Name, "Name")}
              {p(values.party2Name, "Name")}
            </SignatureRow>
            <SignatureRow label="Title">
              {p(values.party1Title, "Title")}
              {p(values.party2Title, "Title")}
            </SignatureRow>
            <SignatureRow label="Company">
              {p(values.party1Company, "Company")}
              {p(values.party2Company, "Company")}
            </SignatureRow>
            <SignatureRow label="Notice Address">
              {p(values.party1Address, "Email or postal address")}
              {p(values.party2Address, "Email or postal address")}
            </SignatureRow>
            <SignatureRow label="Date">
              <span className="h-6 block" />
              <span className="h-6 block" />
            </SignatureRow>
          </tbody>
        </table>

        <p className="text-xs text-muted-foreground">
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline" target="_blank" rel="noreferrer">CC BY 4.0</a>.
        </p>
      </div>

      <hr className="border-border print:border-gray-400" />

      {/* ── Standard Terms ── */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-center">Standard Terms</h2>

        <Section n={1} title="Introduction">
          This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page
          (defined below)) (&ldquo;<strong>MNDA</strong>&rdquo;) allows each party (&ldquo;<strong>Disclosing
          Party</strong>&rdquo;) to disclose or make available information in connection with the{" "}
          <Ref>{p(values.purpose, "Purpose")}</Ref> which (1) the Disclosing Party identifies to the receiving
          party (&ldquo;<strong>Receiving Party</strong>&rdquo;) as &ldquo;confidential&rdquo;,
          &ldquo;proprietary&rdquo;, or the like or (2) should be reasonably understood as confidential or
          proprietary due to its nature and the circumstances of its disclosure (&ldquo;<strong>Confidential
          Information</strong>&rdquo;). Each party&rsquo;s Confidential Information also includes the existence
          and status of the parties&rsquo; discussions and information on the Cover Page. Confidential
          Information includes technical or business information, product designs or roadmaps, requirements,
          pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA,
          the parties must complete and sign a cover page incorporating these Standard Terms (&ldquo;<strong>Cover
          Page</strong>&rdquo;). Each party is identified on the Cover Page and capitalized terms have the
          meanings given herein or on the Cover Page.
        </Section>

        <Section n={2} title="Use and Protection of Confidential Information">
          The Receiving Party shall: (a) use Confidential Information solely for the{" "}
          <Ref>{p(values.purpose, "Purpose")}</Ref>; (b) not disclose Confidential Information to third parties
          without the Disclosing Party&rsquo;s prior written approval, except that the Receiving Party may
          disclose Confidential Information to its employees, agents, advisors, contractors and other
          representatives having a reasonable need to know for the <Ref>{p(values.purpose, "Purpose")}</Ref>,
          provided these representatives are bound by confidentiality obligations no less protective of the
          Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible
          for their compliance with this MNDA; and (c) protect Confidential Information using at least the same
          protections the Receiving Party uses for its own similar information but no less than a reasonable
          standard of care.
        </Section>

        <Section n={3} title="Exceptions">
          The Receiving Party&rsquo;s obligations in this MNDA do not apply to information that it can
          demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it
          rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality
          restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or
          (d) it independently developed without using or referencing the Confidential Information.
        </Section>

        <Section n={4} title="Disclosures Required by Law">
          The Receiving Party may disclose Confidential Information to the extent required by law, regulation or
          regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides
          the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates,
          at the Disclosing Party&rsquo;s expense, with the Disclosing Party&rsquo;s efforts to obtain
          confidential treatment for the Confidential Information.
        </Section>

        <Section n={5} title="Term and Termination">
          This MNDA commences on the <Ref>{formatDate(values.effectiveDate)}</Ref> and expires at the end of
          the <Ref>{mndaTermText(values)}</Ref> Either party may terminate this MNDA for any or no reason upon
          written notice to the other party. The Receiving Party&rsquo;s obligations relating to Confidential
          Information will survive for the <Ref>{confTermText(values)}</Ref>, despite any expiration or
          termination of this MNDA.
        </Section>

        <Section n={6} title="Return or Destruction of Confidential Information">
          Upon expiration or termination of this MNDA or upon the Disclosing Party&rsquo;s earlier request,
          the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing
          Party&rsquo;s written request, destroy all Confidential Information in the Receiving Party&rsquo;s
          possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing
          Party, confirm its compliance with these obligations in writing. As an exception to subsection (b),
          the Receiving Party may retain Confidential Information in accordance with its standard backup or
          record retention policies or as required by law, but the terms of this MNDA will continue to apply
          to the retained Confidential Information.
        </Section>

        <Section n={7} title="Proprietary Rights">
          The Disclosing Party retains all of its intellectual property and other rights in its Confidential
          Information and its disclosure to the Receiving Party grants no license under such rights.
        </Section>

        <Section n={8} title="Disclaimer">
          ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS IS&rdquo;, WITH ALL FAULTS, AND WITHOUT
          WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR
          PURPOSE.
        </Section>

        <Section n={9} title="Governing Law and Jurisdiction">
          This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws
          of the State of <Ref>{p(gl, "State")}</Ref>, without regard to the conflict of laws provisions of
          such <Ref>{p(gl, "State")}</Ref>. Any legal suit, action, or proceeding relating to this MNDA must be
          instituted in the federal or state courts located in <Ref>{p(jur, "Jurisdiction")}</Ref>. Each party
          irrevocably submits to the exclusive jurisdiction of such <Ref>{p(jur, "Jurisdiction")}</Ref> in any
          such suit, action, or proceeding.
        </Section>

        <Section n={10} title="Equitable Relief">
          A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient
          remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable
          relief, including an injunction, in addition to its other remedies.
        </Section>

        <Section n={11} title="General">
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
        </Section>

        <p className="text-xs text-muted-foreground pt-2">
          Common Paper Mutual Non-Disclosure Agreement{" "}
          <a href="https://commonpaper.com/standards/mutual-nda/1.0/" className="underline" target="_blank" rel="noreferrer">
            Version 1.0
          </a>{" "}
          free to use under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline" target="_blank" rel="noreferrer">
            CC BY 4.0
          </a>.
        </p>
      </div>
    </div>
  );
}

function CoverRow({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-border align-top">
      <td className="py-3 pr-4 font-semibold w-1/3 text-sm">
        <span dangerouslySetInnerHTML={{ __html: label }} />
        {sublabel && <div className="text-xs font-normal text-muted-foreground mt-0.5">{sublabel}</div>}
      </td>
      <td className="py-3 text-sm">{children}</td>
    </tr>
  );
}

function SignatureRow({ label, children }: { label: string; children: React.ReactNode }) {
  const [child1, child2] = Array.isArray(children) ? children : [children, null];
  return (
    <tr className="border-b border-border align-top">
      <td className="border border-border p-2 font-medium text-xs">{label}</td>
      <td className="border border-border p-2 text-sm min-h-[2rem]">{child1}</td>
      <td className="border border-border p-2 text-sm min-h-[2rem]">{child2}</td>
    </tr>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p>
        <strong>{n}. {title}.</strong>{" "}{children}
      </p>
    </div>
  );
}

function Ref({ children }: { children: React.ReactNode }) {
  return <span className="underline decoration-dotted decoration-primary/60">{children}</span>;
}
