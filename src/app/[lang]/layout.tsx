import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";
import { i18n, Locale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Guardian Gate",
  description: "Secure your accounts with two-factor authentication.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {
  const { lang } = await params;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700&family=Zilla+Slab:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
