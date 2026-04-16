import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Amour Amer - Wine Pairing Events",
  description: "Discover our wine pairing events",
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
      <body className="min-h-full flex flex-col">
        <header className="border-b border-cream-dark bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-wine rounded-full flex items-center justify-center text-white text-sm font-bold tracking-tight">
                AA
              </div>
              <div>
                <span className="text-lg font-semibold text-wine tracking-tight">
                  Amour Amer
                </span>
                <span className="hidden sm:inline text-xs text-gold ml-2 tracking-widest uppercase">
                  Wine & Food
                </span>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-cream-dark py-8 mt-16">
          <div className="max-w-3xl mx-auto px-6 text-center text-sm text-gray-400">
            Amour Amer &middot; Wine & Food
            <div className="mt-2 text-xs text-gray-300">
              Crafted by{" "}
              <a
                href="https://www.linkedin.com/in/julien-rochart"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-500 transition-colors"
              >
                Julien
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
