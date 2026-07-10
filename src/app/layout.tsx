import type { Metadata } from "next";
import { Cormorant_Garamond, Tiro_Devanagari_Sanskrit, Inter } from "next/font/google";
import "./globals.css";
import CanvasRoot from "@/components/canvas/CanvasRoot";
import StoreHydrator from "@/components/StoreHydrator";
import SmoothScroll from "@/components/providers/SmoothScroll";
import SiteChrome from "@/components/chrome/SiteChrome";
import SoundscapeProvider from "@/components/providers/SoundscapeProvider";

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
  title: "MAHABHARAT — The Epic of Epics",
  description:
    "An immersive guide to the Mahabharat — the dynasty, the war, and the song of the divine. Eighteen parvas. Eighteen days. One dharma.",
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
    >
      <body className="min-h-full flex flex-col">
        <StoreHydrator />
        <SmoothScroll />
        <SoundscapeProvider />
        <CanvasRoot />
        <div className="grain-overlay" aria-hidden />
        <div className="vignette-overlay" aria-hidden />
        <SiteChrome />
        <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
