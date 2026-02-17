import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR, Noto_Serif_KR, Outfit } from "next/font/google"; // Import Serif font
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  preload: false,
});

const notoSerifKR = Noto_Serif_KR({ // Configure Serif font
  variable: "--font-noto-serif-kr",
  weight: ["200", "300", "400", "500", "600", "700", "900"],
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Soul Saju Analysis", // Updated title for better context
  description: "Discover your destiny with ancient wisdom.",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansKR.variable} ${notoSerifKR.variable} ${outfit.variable} antialiased font-sans bg-background text-foreground`}>{children}</body>
    </html>
  );
}
