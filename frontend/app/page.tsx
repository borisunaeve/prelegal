"use client";

import { useState } from "react";
import { NdaForm } from "@/components/NdaForm";
import { NdaPreview } from "@/components/NdaPreview";
import { Button } from "@/components/ui/button";
import { defaultValues } from "@/lib/nda-types";
import type { NdaFormValues } from "@/lib/nda-types";

export default function Home() {
  const [values, setValues] = useState<NdaFormValues>(defaultValues);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="no-print border-b border-border bg-background sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Mutual NDA Creator</h1>
          <p className="text-xs text-muted-foreground">Powered by Common Paper Standard v1.0</p>
        </div>
        <Button onClick={() => window.print()} size="sm">
          Download PDF
        </Button>
      </header>

      {/* Body: two-column split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Form */}
        <aside className="no-print w-80 shrink-0 border-r border-border overflow-y-auto p-5 bg-muted/20">
          <NdaForm values={values} onChange={setValues} />
        </aside>

        {/* Right: Preview */}
        <main className="print-full flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto px-10 py-10">
            <NdaPreview values={values} />
          </div>
        </main>
      </div>
    </div>
  );
}
