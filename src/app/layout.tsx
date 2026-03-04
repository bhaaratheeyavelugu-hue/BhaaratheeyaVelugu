import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import { IOSInstallPrompt } from "@/components/ios-install-prompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bhaaratheeya velugu – Digital Newspaper",
  description: "Read your daily newspaper on any device. Track progress, bookmark pages, and earn levels.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Bhaaratheeya velugu" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "120x120", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0c4a6e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${playfairDisplay.variable} antialiased relative`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(!t)t='light';document.documentElement.dataset.theme=t})();`,
          }}
        />
        <Providers>
          {children}
          <IOSInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
