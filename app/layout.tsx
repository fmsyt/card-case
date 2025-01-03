import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "カードケース",
  description: "カードをケース内で動かし、そのカタカタ音を楽しみます。",
  icons: [
    {
      rel: "icon",
      url: "/icon512_rounded.png",
      sizes: "512x512",
    },
    {
      rel: "apple-touch-icon",
      url: "/icon512_rounded.png",
      sizes: "512x512",
    },
  ],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
