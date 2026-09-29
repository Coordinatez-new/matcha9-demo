import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Pinyon_Script } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const script = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // Client demo: keep it out of search engines until launch.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f0ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
