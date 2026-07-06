import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { DevModeProvider } from "@/lib/devmode";
import { siteUrl, siteName, fullName, siteDescription, siteKeywords } from "@/lib/site-config";
import { cvBasics } from "@/content/cv";
import { readSettings } from "@/lib/site-settings-store";
import { settingsToCssText } from "@/lib/site-settings";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Published site settings — read server-side and injected below so every visitor
  // (no client JS required, no flash) sees the current appearance.
  const settings = await readSettings();
  const overrideCss = settingsToCssText(settings);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${
        settings.toggles.animations ? "" : " site-no-anim"
      }`}
      // Browser extensions (Grammarly, password managers, Dark Reader,
      // translators, …) mutate <html>/<body> attributes before React hydrates,
      // which otherwise trips a hydration-mismatch warning. This only tells
      // React to accept the DOM's own attributes on these two elements — real
      // mismatches inside the page are still reported.
      suppressHydrationWarning
    >
      <head>
        {/* Live appearance overrides from the dev console — applied for all visitors. */}
        <style id="site-overrides" dangerouslySetInnerHTML={{ __html: overrideCss }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {settings.toggles.publicGrid && (
          <div aria-hidden className="site-grid-overlay bp-grid" />
        )}
        <DevModeProvider initialSettings={settings}>
          <Nav />
          <main className="relative z-[1] flex-1">{children}</main>
          {settings.toggles.footer && <Footer />}
        </DevModeProvider>
      </body>
    </html>
  );
}
