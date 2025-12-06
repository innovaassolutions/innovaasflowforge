import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InnovaasFlow Forge - Smart Industry Readiness Assessment",
  description: "AI-powered Smart Industry 4.0 readiness assessment platform with multi-stakeholder interviews and synthesis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">
        <GlobalHeader />
        {children}
      </body>
    </html>
  );
}
