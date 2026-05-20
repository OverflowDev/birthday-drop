'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useDisconnect } from 'wagmi'
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
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)

  function copyAddress(addr: string) {
    navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
                path === href ? 'text-white' : 'text-white/55 hover:text-white'
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

              if (connected) {
                return (
                  <div className="flex items-center">
                    <button
                      onClick={() => copyAddress(account.address ?? '')}
                      className="border border-[#FFE234]/30 text-[#FFE234] px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest hover:bg-[#FFE234]/10 transition-colors duration-150"
                    >
                      {copied ? 'Copied!' : account.displayName}
                    </button>
                    <button
                      onClick={() => disconnect()}
                      title="Disconnect"
                      className="border border-[#FFE234]/30 border-l-0 px-3 py-1.5 text-[11px] font-mono text-white/55 hover:text-red-400 hover:border-red-400/40 transition-colors duration-150"
                    >
                      ×
                    </button>
                  </div>
                )
              }

              return (
                <button
                  onClick={openConnectModal}
                  className="border border-[#FFE234]/30 text-[#FFE234] px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest hover:bg-[#FFE234] hover:text-black hover:border-[#FFE234] transition-colors duration-150"
                >
                  Connect
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
