import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = 'https://flowforge.innovaas.co'
const siteTitle = 'FlowForge — Encode Your Expertise, Scale Your Impact'
const siteDescription =
  'Encode your consulting methodology, frameworks, and questioning approach into AI — then run it across multiple clients simultaneously. Your brain, multiplied. Your expertise, at scale.'

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'FlowForge',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FlowForge',
  url: siteUrl,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: siteDescription,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/OnlineOnly',
  },
  creator: {
    '@type': 'Organization',
    name: 'Innovaas',
    url: 'https://innovaas.co',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <Script
        id="reb2b-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `!function(key) {if (window.reb2b) return;window.reb2b = {loaded: true};var s = document.createElement("script");s.async = true;s.src = "https://ddwl4m2hdecbv.cloudfront.net/b/" + key + "/" + key + ".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s, document.getElementsByTagName("script")[0]);}("GNLKQH7W8R6Q");`,
        }}
      />
      <Script
        src="https://analytics.innovaas.co/script.js"
        data-website-id="38c8edc6-dece-4a73-ac23-54b7a12b6234"
        strategy="afterInteractive"
      />
      <body className="antialiased font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GlobalHeader />
        {children}
      </body>
    </html>
  );
}
