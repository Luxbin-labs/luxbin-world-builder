import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUXBIN Photonic World Builder",
  description: "Build AI-generated worlds encoded in LUXBIN light language using Gemini 3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
