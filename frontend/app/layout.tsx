import type { Metadata } from 'next'
import Providers from './providers'
import './globals.css'

export const metadata: Metadata = {
  title:       'Birthday Drop — Stablecoin Gifts on Arc',
  description: 'Send time-locked USDC/EURC birthday gifts on Arc. Each gift mints a unique NFT card to your recipient.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
