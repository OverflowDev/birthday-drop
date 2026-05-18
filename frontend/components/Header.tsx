'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CoinDropMark } from './LogoCoinDrop'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Home',      href: '/'          },
  { label: 'Create',    href: '/create'    },
  { label: 'Dashboard', href: '/dashboard' },
]

export default function Header() {
  const path = usePathname()
  const isHome = path === '/'

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.07] bg-[#080808]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2 group">
          <CoinDropMark size={26} />
          <span className="text-[12px] font-black uppercase tracking-tight text-white leading-none hidden xs:block">
            Birthday<span className="text-[#FFE234]">Drop</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest transition-colors duration-150',
                path === href ? 'text-white' : 'text-white/30 hover:text-white/70'
              )}
            >
              {path === href && <span className="text-[#FFE234] mr-1.5">·</span>}
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet — hidden on home, shown on app pages */}
        {!isHome ? (
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              if (!mounted) return <div className="w-24 h-8" />
              const connected = account && chain

              if (connected && chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="border border-red-500/40 text-red-400 px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest hover:bg-red-500/10 transition-colors duration-150"
                  >
                    Wrong Network
                  </button>
                )
              }

              return (
                <button
                  onClick={connected ? openAccountModal : openConnectModal}
                  className="border border-[#FFE234]/30 text-[#FFE234] px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest hover:bg-[#FFE234] hover:text-black hover:border-[#FFE234] transition-colors duration-150"
                >
                  {connected ? account.displayName : 'Connect'}
                </button>
              )
            }}
          </ConnectButton.Custom>
        ) : (
          /* On home, just a subtle nav link to the app */
          <Link
            href="/create"
            className="hidden sm:inline-flex items-center gap-2 border border-white/10 text-white/40 px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest hover:border-[#FFE234]/40 hover:text-[#FFE234] transition-colors duration-150"
          >
            Launch App →
          </Link>
        )}
      </div>
    </header>
  )
}
