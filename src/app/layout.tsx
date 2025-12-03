import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PwaInstaller from "./pwa-installer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Breathe",
  description: "A simple app to help you breathe.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Breathe",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PwaInstaller />
        {children}
      </body>
    </html>
  );
}
