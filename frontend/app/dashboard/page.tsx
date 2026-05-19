'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast'

import Header from '@/components/Header'
import GiftItem from '@/components/GiftItem'
import { BIRTHDAY_DROP_ABI } from '@/lib/abi'
import { BIRTHDAY_DROP_ADDRESS } from '@/lib/contracts'
import { cn } from '@/lib/utils'

type Tab = 'received' | 'sent'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [tab, setTab] = useState<Tab>('received')

  const {
    data: receivedGifts = [],
    isLoading: loadingReceived,
    refetch: refetchReceived,
  } = useReadContract({
    address: BIRTHDAY_DROP_ADDRESS,
    abi:     BIRTHDAY_DROP_ABI,
    functionName: 'getGiftsByRecipient',
    args:    [address!],
    query:   { enabled: !!address, gcTime: 0 },
  })

  const {
    data: sentGifts = [],
    isLoading: loadingSent,
    refetch: refetchSent,
  } = useReadContract({
    address: BIRTHDAY_DROP_ADDRESS,
    abi:     BIRTHDAY_DROP_ABI,
    functionName: 'getGiftsBySender',
    args:    [address!],
    query:   { enabled: !!address, gcTime: 0 },
  })

  function handleRefresh() {
    refetchReceived()
    refetchSent()
  }

  const gifts     = tab === 'received' ? receivedGifts : sentGifts
  const isLoading = tab === 'received' ? loadingReceived : loadingSent
  const sorted    = [...(gifts as any[])].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))

  const pending   = sorted.filter((g: any) => !g.claimed && !g.cancelled)
  const claimable = pending.filter((g: any) => Date.now() >= Number(g.birthdayTimestamp) * 1000)
  const locked    = pending.filter((g: any) => Date.now() <  Number(g.birthdayTimestamp) * 1000)
  const done      = sorted.filter((g: any) => g.claimed || g.cancelled)

  // Stats across both tabs
  const totalSent      = (sentGifts     as any[]).length
  const totalReceived  = (receivedGifts as any[]).length
  const claimableCount = (receivedGifts as any[]).filter(
    (g: any) => !g.claimed && !g.cancelled && Date.now() >= Number(g.birthdayTimestamp) * 1000
  ).length

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#080808] text-white">
        <Header />
        <div className="pt-36 pb-20 px-5 flex flex-col items-center text-center gap-8">
          <div className="border border-white/[0.07] p-12 flex flex-col items-center gap-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Dashboard</p>
            <h1 className="text-4xl font-black uppercase tracking-tight">
              Connect<br />
              <span className="text-[#FFE234]">Wallet</span>
            </h1>
            <p className="text-white/40 text-sm font-mono">
              See all your birthday gifts — sent and received.
            </p>
            <button
              onClick={openConnectModal}
              className="border border-[#FFE234]/30 text-[#FFE234] px-6 py-3 text-[11px] font-mono uppercase tracking-widest hover:bg-[#FFE234] hover:text-black hover:border-[#FFE234] transition-colors"
            >
              Connect Wallet →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Header />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 0,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
          },
        }}
      />

      <div className="pt-24 pb-20 px-5 sm:px-10">
        <div className="mx-auto max-w-6xl">

          {/* Page header */}
          <div className="border-b border-white/[0.07] pb-6 mb-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">Overview</p>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none">
                Gift<br />
                <span className="text-[#FFE234]">Dashboard</span>
              </h1>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 border border-[#FFE234]/30 text-[#FFE234] px-5 py-2.5 text-[11px] font-mono uppercase tracking-widest hover:bg-[#FFE234] hover:text-black hover:border-[#FFE234] transition-colors w-fit self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Send Gift
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 border-b border-white/[0.07] mb-0">
            {[
              { label: 'Gifts Sent',     value: totalSent },
              { label: 'Gifts Received', value: totalReceived },
              {
                label: 'Claimable Now',
                value: claimableCount,
                highlight: claimableCount > 0,
              },
            ].map(({ label, value, highlight }, i) => (
              <div
                key={label}
                className={cn(
                  'px-5 sm:px-8 py-5 flex flex-col gap-1',
                  i < 2 && 'border-r border-white/[0.07]',
                )}
              >
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/25">{label}</p>
                <p className={cn(
                  'text-2xl font-black tabular-nums',
                  highlight ? 'text-[#FFE234]' : 'text-white',
                )}>
                  {value}
                  {highlight && (
                    <span className="ml-2 w-2 h-2 bg-[#FFE234] rounded-full inline-block align-middle animate-pulse" />
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.07] mb-8">
            {([
              { key: 'received', label: 'Received', count: totalReceived },
              { key: 'sent',     label: 'Sent',     count: totalSent     },
            ] as const).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'px-6 py-3 text-[11px] font-mono uppercase tracking-widest transition-colors relative',
                  tab === key
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#FFE234]'
                    : 'text-white/30 hover:text-white/60',
                )}
              >
                {label}
                <span className={cn(
                  'ml-2 text-[9px]',
                  tab === key ? 'text-[#FFE234]' : 'text-white/20',
                )}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-24 gap-3 text-white/30">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[11px] font-mono uppercase tracking-widest">Loading…</span>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && sorted.length === 0 && (
            <div className="border border-white/[0.07] flex flex-col items-center justify-center py-24 gap-5 text-center">
              <p className="text-5xl">{tab === 'received' ? '🎁' : '🎂'}</p>
              <p className="text-white/30 text-[11px] font-mono uppercase tracking-widest">
                {tab === 'received'
                  ? 'No gifts received yet'
                  : 'No gifts sent yet'}
              </p>
              {tab === 'sent' && (
                <Link
                  href="/create"
                  className="border border-[#FFE234]/30 text-[#FFE234] px-6 py-2.5 text-[11px] font-mono uppercase tracking-widest hover:bg-[#FFE234] hover:text-black transition-colors"
                >
                  Create First Gift →
                </Link>
              )}
            </div>
          )}

          {/* ── Claimable Now ───────────────────────────────────────────── */}
          {!isLoading && tab === 'received' && claimable.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 bg-[#FFE234] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFE234]">
                  Claim Now — {claimable.length} gift{claimable.length > 1 ? 's' : ''} ready
                </span>
              </div>
              <div className="border border-[#FFE234]/20 p-px">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#FFE234]/10">
                  {claimable.map((g: any) => (
                    <GiftItem key={g.id.toString()} gift={g} mode="received" onDone={handleRefresh} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Upcoming / Active ──────────────────────────────────────── */}
          {!isLoading && locked.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 border border-white/20" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                  {tab === 'received' ? 'Upcoming' : 'Active'} — {locked.length} gift{locked.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
                {locked.map((g: any) => (
                  <GiftItem key={g.id.toString()} gift={g} mode={tab} onDone={handleRefresh} />
                ))}
              </div>
            </div>
          )}

          {/* ── History ───────────────────────────────────────────────── */}
          {!isLoading && done.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 bg-white/10" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">
                  History — {done.length} gift{done.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.03]">
                {done.map((g: any) => (
                  <GiftItem key={g.id.toString()} gift={g} mode={tab} onDone={handleRefresh} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
