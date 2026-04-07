"use client";

import { NdaFormValues } from "@/lib/nda-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface Props {
  values: NdaFormValues;
  onChange: (values: NdaFormValues) => void;
}

export function NdaForm({ values, onChange }: Props) {
  function set<K extends keyof NdaFormValues>(key: K, value: NdaFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-6 text-sm">
      {/* Purpose */}
      <div className="space-y-2">
        <Label htmlFor="purpose" className="font-semibold">Purpose</Label>
        <p className="text-muted-foreground text-xs">How Confidential Information may be used</p>
        <Textarea
          id="purpose"
          rows={3}
          value={values.purpose}
          onChange={(e) => set("purpose", e.target.value)}
          placeholder="Evaluating whether to enter into a business relationship..."
        />
      </div>

      <Separator />

      {/* Effective Date */}
      <div className="space-y-2">
        <Label htmlFor="effectiveDate" className="font-semibold">Effective Date</Label>
        <Input
          id="effectiveDate"
          type="date"
          value={values.effectiveDate}
          onChange={(e) => set("effectiveDate", e.target.value)}
        />
      </div>

      <Separator />

      {/* MNDA Term */}
      <div className="space-y-3">
        <Label className="font-semibold">MNDA Term</Label>
        <p className="text-muted-foreground text-xs">The length of this MNDA</p>
        <RadioGroup
          value={values.mndaTermType}
          onValueChange={(v) => set("mndaTermType", v as "fixed" | "perpetual")}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="fixed" id="mndaFixed" />
            <Label htmlFor="mndaFixed" className="flex items-center gap-2 font-normal cursor-pointer">
              Expires after
              <Input
                type="number"
                min={1}
                value={values.mndaTermYears}
                onChange={(e) => set("mndaTermYears", e.target.value)}
                className="w-16 h-7 text-center"
                disabled={values.mndaTermType !== "fixed"}
              />
              year(s) from Effective Date
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="perpetual" id="mndaPerpetual" />
            <Label htmlFor="mndaPerpetual" className="font-normal cursor-pointer">
              Continues until terminated
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Term of Confidentiality */}
      <div className="space-y-3">
        <Label className="font-semibold">Term of Confidentiality</Label>
        <p className="text-muted-foreground text-xs">How long Confidential Information is protected</p>
        <RadioGroup
          value={values.confidentialityTermType}
          onValueChange={(v) => set("confidentialityTermType", v as "fixed" | "perpetual")}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="fixed" id="confFixed" />
            <Label htmlFor="confFixed" className="flex items-center gap-2 font-normal cursor-pointer">
              <Input
                type="number"
                min={1}
                value={values.confidentialityTermYears}
                onChange={(e) => set("confidentialityTermYears", e.target.value)}
                className="w-16 h-7 text-center"
                disabled={values.confidentialityTermType !== "fixed"}
              />
              year(s) from Effective Date
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="perpetual" id="confPerpetual" />
            <Label htmlFor="confPerpetual" className="font-normal cursor-pointer">
              In perpetuity
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Governing Law & Jurisdiction */}
      <div className="space-y-4">
        <Label className="font-semibold">Governing Law &amp; Jurisdiction</Label>
        <div className="space-y-2">
          <Label htmlFor="governingLaw" className="text-xs text-muted-foreground">Governing Law (state)</Label>
          <Input
            id="governingLaw"
            value={values.governingLaw}
            onChange={(e) => set("governingLaw", e.target.value)}
            placeholder="e.g. Delaware"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jurisdiction" className="text-xs text-muted-foreground">Jurisdiction (city/county and state)</Label>
          <Input
            id="jurisdiction"
            value={values.jurisdiction}
            onChange={(e) => set("jurisdiction", e.target.value)}
            placeholder="e.g. New Castle, DE"
          />
        </div>
      </div>

      <Separator />

      {/* Party 1 */}
      <div className="space-y-3">
        <Label className="font-semibold">Party 1</Label>
        {[
          { key: "party1Name" as const, label: "Print Name", placeholder: "Jane Smith" },
          { key: "party1Title" as const, label: "Title", placeholder: "CEO" },
          { key: "party1Company" as const, label: "Company", placeholder: "Acme Inc." },
          { key: "party1Address" as const, label: "Notice Address", placeholder: "jane@acme.com" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={key} className="text-xs text-muted-foreground">{label}</Label>
            <Input
              id={key}
              value={values[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <Separator />

      {/* Party 2 */}
      <div className="space-y-3">
        <Label className="font-semibold">Party 2</Label>
        {[
          { key: "party2Name" as const, label: "Print Name", placeholder: "John Doe" },
          { key: "party2Title" as const, label: "Title", placeholder: "CTO" },
          { key: "party2Company" as const, label: "Company", placeholder: "Beta Corp." },
          { key: "party2Address" as const, label: "Notice Address", placeholder: "john@betacorp.com" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={key} className="text-xs text-muted-foreground">{label}</Label>
            <Input
              id={key}
              value={values[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
