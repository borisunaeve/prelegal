import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Lora } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const lora = Lora({
  variable: "--font-document",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Mutual NDA Creator | Prelegal",
  description:
    "Create and download a Mutual Non-Disclosure Agreement powered by Common Paper Standard v1.0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
