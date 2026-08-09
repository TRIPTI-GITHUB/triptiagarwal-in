import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Headings sitewide (DesignSystem.md / Homepage_UI_Design_Brief.md §10) -
// loading it here also fixes WelcomeOverlay/ExhibitModal/Flipbook's
// existing inline `fontFamily: "Playfair Display, ..."` styles, which
// had no actual webfont backing this family name before now (only a
// separate static .ttf wired into the 3D museum's WebGL text) and were
// silently falling back to Georgia - @font-face is global once
// declared, so no edits needed in those three files.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tripti Agarwal Heritage Lab | Preserving the Past. Inspiring the Future.",
    template: "%s | Tripti Agarwal Heritage Lab",
  },
  description:
    "An AI-powered digital heritage and education platform exploring philately, numismatics, postal history, and cultural heritage through curated collections, exhibits, and storytelling.",
  metadataBase: new URL("https://triptiagarwal.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}