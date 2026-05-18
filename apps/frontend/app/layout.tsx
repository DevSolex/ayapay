import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AyaPay — Decentralized Crypto Payroll',
  description: 'Pay your global team in stablecoins on Celo. Fast, transparent, borderless.',
  other: {
    'talentapp:project_verification': '8188253ffd790fc838911247e5c5ed3bd181aa01123f88e1558c6d140c8d89197e665162ef474d09d8dfbff8c8b68cd145932d6f65413f4c7e19f414e8cf5905',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
