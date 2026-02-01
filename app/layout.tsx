import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FlowForge — Encode Your Expertise, Scale Your Impact",
  description: "Encode your consulting methodology, frameworks, and questioning approach into AI — then run it across multiple clients simultaneously. Your brain, multiplied. Your expertise, at scale.",
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-orb.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
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
