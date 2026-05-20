'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Loader2, Plus, RefreshCw } from 'lucide-react'

import Link from 'next/link'
import { Toaster } from 'react-hot-toast'

import Header from '@/components/Header'
import GiftSection from '@/components/GiftSection'
import NFTGallery from '@/components/NFTGallery'
import { BIRTHDAY_DROP_ABI } from '@/lib/abi'
import { BIRTHDAY_DROP_ADDRESS } from '@/lib/contracts'
import { cn, shortAddr, formatTokenAmount, formatBirthday } from '@/lib/utils'
import { SUPPORTED_TOKENS } from '@/lib/contracts'

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

  // Recurring gifts due for renewal — show 3 days before next birthday, up to 30 days after
  const THREE_DAYS = 3 * 24 * 3600
  const THIRTY_DAYS = 30 * 24 * 3600
  const nowSec = Date.now() / 1000
  const renewalDue = (sentGifts as any[]).filter((g: any) => {
    if (!g.recurring || !g.claimed) return false
    const next = Number(g.birthdayTimestamp) + 365 * 24 * 3600
    return nowSec >= next - THREE_DAYS && nowSec <= next + THIRTY_DAYS
  })

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#080808] text-white">
        <Header />
        <div className="pt-36 pb-20 px-5 flex flex-col items-center text-center gap-8">
          <div className="border border-white/[0.07] p-12 flex flex-col items-center gap-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/55">Dashboard</p>
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
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/55 mb-2">Overview</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/[0.07] mb-0">
            {[
              { label: 'Gifts Sent',     value: totalSent },
              { label: 'Gifts Received', value: totalReceived },
              {
                label: 'Claimed',
                value: (receivedGifts as any[]).filter((g: any) => g.claimed).length,
              },
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
                  i < 3 && 'border-r border-white/[0.07]',
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

          {/* ── Renewal banner ──────────────────────────────────────────── */}
          {renewalDue.length > 0 && (
            <div className="border border-[#FFE234]/30 bg-[#FFE234]/5 px-5 py-4 flex flex-col gap-3 mt-0 mb-0">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#FFE234]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFE234]">
                  Annual Gift{renewalDue.length > 1 ? 's' : ''} Due for Renewal
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {renewalDue.map((g: any) => {
                  const nextBirthday = Number(g.birthdayTimestamp) + 365 * 24 * 3600
                  const daysLeft = Math.ceil((nextBirthday - nowSec) / 86400)
                  const token = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === g.token.toLowerCase())
                  const params = new URLSearchParams({
                    recipient: g.recipient,
                    amount:    (Number(g.amount) / 1e6).toString(),
                    token:     g.token,
                    recurring: 'true',
                  })
                  return (
                    <div key={g.id.toString()} className="flex items-center justify-between gap-4 border-t border-[#FFE234]/10 pt-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-mono text-white/70">
                          {shortAddr(g.recipient)} · {formatTokenAmount(g.amount)} {token?.symbol}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">
                          Next birthday: {formatBirthday(BigInt(nextBirthday))} ·{' '}
                          {daysLeft > 0
                            ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} away`
                            : daysLeft === 0
                            ? 'today!'
                            : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`}
                        </span>
                      </div>
                      <Link
                        href={`/create?${params.toString()}`}
                        className="shrink-0 border border-[#FFE234]/40 text-[#FFE234] px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest hover:bg-[#FFE234] hover:text-black transition-colors"
                      >
                        Renew →
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
                    : 'text-white/55 hover:text-white/60',
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
            <div className="flex items-center justify-center py-24 gap-3 text-white/55">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[11px] font-mono uppercase tracking-widest">Loading…</span>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && sorted.length === 0 && (
            <div className="border border-white/[0.07] flex flex-col items-center justify-center py-24 gap-5 text-center">
              <p className="text-5xl">{tab === 'received' ? '🎁' : '🎂'}</p>
              <p className="text-white/55 text-[11px] font-mono uppercase tracking-widest">
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
          {!isLoading && tab === 'received' && (
            <div className={claimable.length > 0 ? 'border border-[#FFE234]/20 p-px mb-10' : ''}>
              <GiftSection
                label="Claim Now"
                dot="yellow"
                gifts={claimable}
                mode="received"
                onDone={handleRefresh}
                wrapClass="bg-[#FFE234]/10"
              />
            </div>
          )}

          {/* ── Upcoming / Active ──────────────────────────────────────── */}
          {!isLoading && (
            <GiftSection
              label={tab === 'received' ? 'Upcoming' : 'Active'}
              dot="dim"
              gifts={locked}
              mode={tab}
              onDone={handleRefresh}
              wrapClass="bg-white/[0.04]"
            />
          )}

          {/* ── History ───────────────────────────────────────────────── */}
          {!isLoading && (
            <GiftSection
              label="History"
              dot="faint"
              gifts={done}
              mode={tab}
              onDone={handleRefresh}
              wrapClass="bg-white/[0.03]"
            />
          )}

          {/* ── NFT Gallery (always visible, shows all received cards) ── */}
          {!loadingReceived && (
            <NFTGallery gifts={receivedGifts as any[]} />
          )}
        </div>
      </div>
    </div>
  )
}
