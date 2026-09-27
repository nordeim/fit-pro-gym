import type { Metadata } from "next";

import { AppProvider } from "@/components/providers";
import { Toaster } from "@/components/layout/toaster";

import "./globals.css";

export const metadata: Metadata = {
  // Canonical public origin (NEXT_PUBLIC_SITE_URL in .env) — resolves
  // metadataBase + Open Graph URLs when set; harmless when unset (local dev).
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: "FitPro GYM App",
    template: "%s | FitPro GYM App",
  },
  description:
    "Your all-in-one fitness solution. Seamlessly manage gym memberships and shop premium fitness gear, supplements, and apparel.",
  applicationName: "FitPro GYM App",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-900 font-sans antialiased">
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
