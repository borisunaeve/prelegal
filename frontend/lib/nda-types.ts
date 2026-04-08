export interface NdaFormValues {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "fixed" | "perpetual";
  mndaTermYears: string;
  confidentialityTermType: "fixed" | "perpetual";
  confidentialityTermYears: string;
  governingLaw: string;
  jurisdiction: string;
  party1Name: string;
  party1Title: string;
  party1Company: string;
  party1Address: string;
  party2Name: string;
  party2Title: string;
  party2Company: string;
  party2Address: string;
}

export const defaultValues: NdaFormValues = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })(),
  mndaTermType: "fixed",
  mndaTermYears: "1",
  confidentialityTermType: "fixed",
  confidentialityTermYears: "1",
  governingLaw: "",
  jurisdiction: "",
  party1Name: "",
  party1Title: "",
  party1Company: "",
  party1Address: "",
  party2Name: "",
  party2Title: "",
  party2Company: "",
  party2Address: "",
};
