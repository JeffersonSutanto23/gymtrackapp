import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrackPump — Gym & Nutrition Tracker",
  description: "Track gym progress and nutrition for clean bulk, bulk, or cut.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TrackPump",
  },
  icons: {
    icon: ["/icon-192.png", "/icon-512.png"],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
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
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-900">
        <ServiceWorkerRegister />
        <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black" />
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-amber-500/20 blur-[100px]" />
          <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-[110px]" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-600/15 blur-[100px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
