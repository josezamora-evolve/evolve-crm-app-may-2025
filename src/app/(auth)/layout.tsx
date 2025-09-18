import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-plus-jakarta-sans" 
});

export const metadata: Metadata = {
  title: "CRM IA - Autenticación",
  description: "Iniciar sesión en CRM IA",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans min-h-screen bg-white`}>
        {children}
      </body>
    </html>
  );
}
