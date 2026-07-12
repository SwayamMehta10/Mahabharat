import type { Metadata } from "next";
import { Cormorant_Garamond, Tiro_Devanagari_Sanskrit, Inter } from "next/font/google";
import "./globals.css";
import CanvasRoot from "@/components/canvas/CanvasRootLazy";
import StoreHydrator from "@/components/StoreHydrator";
import SmoothScroll from "@/components/providers/SmoothScroll";
import SiteChrome from "@/components/chrome/SiteChrome";
import KarnaSecret from "@/components/chrome/KarnaSecret";
import SoundscapeProvider from "@/components/providers/SoundscapeProvider";
import { Analytics } from "@vercel/analytics/next"

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const tiro = Tiro_Devanagari_Sanskrit({
  variable: "--font-tiro",
  subsets: ["devanagari", "latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MAHABHARAT · The Epic of Epics",
  description:
    "An immersive guide to the Mahabharat: the dynasty, the war, and the song of the divine. Eighteen parvas. Eighteen days. One dharma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${tiro.variable} ${inter.variable} h-full antialiased`}
      // the pre-hydration script stamps data-js on <html>; expected mismatch
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* progressive-reveal gate: animation initial-states (hidden text) only
            apply when JS is actually running; crawlers, link previews, and a
            failed script load all still see the content */}
        <script
          dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.js="1"` }}
        />
        <StoreHydrator />
        <SmoothScroll />
        <SoundscapeProvider />
        <CanvasRoot />
        <div className="grain-overlay" aria-hidden />
        <div className="vignette-overlay" aria-hidden />
        <SiteChrome />
        <KarnaSecret />
        <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
