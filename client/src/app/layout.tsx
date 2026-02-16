import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Requirement Analyst | AI-Powered Requirements Analysis",
  description:
    "Analyze your project requirements for missing pieces, ambiguities, edge cases, and technical gaps. Think like a senior architect — powered by Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans noise">{children}</body>
    </html>
  );
}
