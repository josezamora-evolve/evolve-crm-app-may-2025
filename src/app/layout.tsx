import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Image from 'next/image';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CRM App",
  description: "A modern CRM application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-gray-50`}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                {/* Use a fixed-size relative container and Next/Image fill to avoid blurry scaling */}
                <div className="relative w-40 h-10">
                  <Image
                    src="/logo.png"
                    alt="CRM"
                    fill
                    style={{ objectFit: 'contain' }}
                    quality={100}
                    priority
                  />
                </div>
                <Navigation />
              </div>
            </div>
          </header>
          <main className="flex-1 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
