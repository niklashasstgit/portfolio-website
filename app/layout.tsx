import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { DevModeProvider } from "@/lib/devmode";
import { siteUrl, siteName, fullName, siteDescription, siteKeywords } from "@/lib/site-config";
import { cvBasics } from "@/content/cv";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Aerospace Engineer`,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: fullName, url: siteUrl }],
  creator: fullName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: `${siteName} — Aerospace Engineer`,
    title: `${siteName} — Aerospace Engineer`,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Aerospace Engineer`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: fullName,
  alternateName: siteName,
  url: siteUrl,
  jobTitle: "Aerospace Engineer",
  email: `mailto:${cvBasics.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: cvBasics.location,
  },
  alumniOf: ["University of Stuttgart", "EPFL"],
  sameAs: [cvBasics.linkedinHref, cvBasics.githubHref],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <DevModeProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </DevModeProvider>
      </body>
    </html>
  );
}
