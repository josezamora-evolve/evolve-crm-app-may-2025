import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
})

export const metadata = {
  title: 'CRM IA',
  description: 'Customer Relationship Management Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
