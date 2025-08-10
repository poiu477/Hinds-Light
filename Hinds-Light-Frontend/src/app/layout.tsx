import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hinds-Light-Frontend",
  description: "Translated Hebrew news and social feed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
          try {
            var cookie = document.cookie.split(';').map(function(c){return c.trim()}).find(function(c){return c.indexOf('theme=')===0});
            var theme = cookie ? cookie.split('=')[1] : null;
            var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            var shouldDark = theme === 'dark' || ((!theme || theme === 'system') && prefersDark);
            document.documentElement.classList.toggle('dark', !!shouldDark);
          } catch (e) {}
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
