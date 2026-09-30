import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Pinyon_Script } from "next/font/google";
import localFont from "next/font/local";
import { site, siteOrigin } from "@/lib/site";
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

// Japanese accents (kanji and kana): a subset of Shippori Mincho holding only the characters
// the site uses. Rebuild with `node scripts/subset-japanese-font.mjs` after changing them.
const japanese = localFont({
  src: [
    { path: "../assets/fonts/shippori-mincho-500.woff2", weight: "500" },
    { path: "../assets/fonts/shippori-mincho-700.woff2", weight: "700" },
  ],
  variable: "--font-shippori",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
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

// Marks JS as available before first paint so scroll reveals can animate. Failsafe: if
// IntersectionObserver hasn't answered within 2.5 s, drop the flag and show everything.
const jsFlag =
  "var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!window.__m9io)d.classList.remove('js')},2500)";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${script.variable} ${japanese.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
