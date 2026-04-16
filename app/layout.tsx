import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Mitr } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mitr = Mitr({
  variable: "--font-mitr",
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: "Enrico's Restaurant - Loyalty Rewards Program",
  description: "Earn points on every purchase and unlock exclusive rewards at Enrico's Restaurant. Join our loyalty program today!",
  icons: {
    icon: [
      { url: "/enricos.ico", sizes: "any" },
      { url: "/enricos.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/enricos.png", sizes: "180x180" },
  },
  manifest: "/site.webmanifest",
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#dc2626" />
        <link rel="icon" href="/enricos.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/enricos.png" />
        <link rel="shortcut icon" href="/enricos.ico" type="image/x-icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mitr.variable} antialiased`}
      >
          {children}
      </body>
    </html>
  );
}
