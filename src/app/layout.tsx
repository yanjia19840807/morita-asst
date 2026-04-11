import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/nav-bar";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "森田助手",
  description:
    "真实案例 + 森田疗法智慧，让你知道：你并不孤单。顺其自然，为所当为。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col p-4">
        <header>
          <Navbar />
        </header>
        {children}
        <footer>YunTianJiaYuan.INC</footer>
      </body>
    </html>
  );
}
