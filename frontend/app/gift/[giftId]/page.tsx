'use client'

import { useEffect, useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { ExternalLink, Share2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import Header from '@/components/Header'
import GiftCardPreview from '@/components/GiftCardPreview'
import CountdownTimer from '@/components/CountdownTimer'
import { BIRTHDAY_DROP_ABI } from '@/lib/abi'
import { BIRTHDAY_DROP_ADDRESS, SUPPORTED_TOKENS, THEMES, EXPLORER_URL, BIRTHDAY_CARD_ADDRESS } from '@/lib/contracts'
import { shortAddr, formatTokenAmount, formatBirthday, isBirthdayPassed, explorerTx, explorerAddr } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function GiftRevealPage({ params }: { params: { giftId: string } }) {
  const { giftId } = params
  const { address, isConnected } = useAccount()

  const { data: gift, isLoading, refetch } = useReadContract({
    address: BIRTHDAY_DROP_ADDRESS,
    abi:     BIRTHDAY_DROP_ABI,
    functionName: 'getGift',
    args:    [BigInt(giftId)],
    query:   { retry: false },
  })

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const { writeContractAsync, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (txConfirmed) {
      toast.success('Gift claimed!')
      refetch()
    }
  }, [txConfirmed])

  async function handleClaim() {
    if (!gift) return
    try {
      const hash = await writeContractAsync({
        address: BIRTHDAY_DROP_ADDRESS,
        abi:     BIRTHDAY_DROP_ABI,
        functionName: 'claimGift',
        args:    [(gift as any).id],
      })
      setTxHash(hash)
      toast.success('Claim tx sent!')
    } catch (e: any) {
      toast.error(e.shortMessage ?? e.message ?? 'Transaction failed')
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Gift link copied!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-white/30 animate-pulse">
          Loading gift…
        </span>
      </div>
    )
  }

  if (!gift || (gift as any).id === 0n) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center gap-6">
        <p className="text-6xl">🎁</p>
        <p className="text-[11px] font-mono uppercase tracking-widest text-white/30">Gift not found</p>
        <Link
          href="/"
          className="border border-white/10 px-6 py-2.5 text-[11px] font-mono uppercase tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-colors"
        >
          ← Go Home
        </Link>
      </div>
    )
  }

  const g         = gift as any
  const token     = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === g.token.toLowerCase())
  const theme     = THEMES[g.theme % 5]
  const ready     = isBirthdayPassed(g.birthdayTimestamp)
  const loading   = isPending || isConfirming
  const isRecipient = address?.toLowerCase() === g.recipient.toLowerCase()

  const status: 'claimed' | 'cancelled' | 'pending' =
    g.claimed ? 'claimed' : g.cancelled ? 'cancelled' : 'pending'

  const amountDisplay = `${formatTokenAmount(g.amount)} ${token?.symbol ?? '?'}`

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
        <div className="mx-auto max-w-4xl">

          {/* Back */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors mb-10"
          >
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </Link>

          {/* Header */}
          <div className="border-b border-white/[0.07] pb-6 mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">
                Gift #{giftId}
              </p>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none">
                {status === 'claimed'   && <><span className="text-emerald-400">Claimed</span></>}
                {status === 'cancelled' && <><span className="text-red-400">Cancelled</span></>}
                {status === 'pending' && ready  && <><span className="text-[#FFE234]">Unwrap</span><br />Your Gift</>}
                {status === 'pending' && !ready && <>Birthday<br /><span className="text-[#FFE234]">Gift</span></>}
              </h1>
            </div>
            <div className="flex gap-0 border border-white/10">
              <button
                onClick={handleShare}
                className="px-4 py-2.5 border-r border-white/10 text-white/30 hover:text-white/70 hover:bg-white/[0.03] transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <a
                href={explorerAddr(BIRTHDAY_DROP_ADDRESS)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-colors flex items-center gap-2"
              >
                ArcScan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_320px] gap-10 items-start">

            {/* Left — card + actions */}
            <div className="flex flex-col gap-6">

              {/* NFT Card preview */}
              <GiftCardPreview
                sender={g.sender}
                recipient={g.recipient}
                amount={formatTokenAmount(g.amount)}
                symbol={token?.symbol ?? '?'}
                message={g.message}
                birthday={new Date(Number(g.birthdayTimestamp) * 1000)}
                themeId={g.theme}
                status={status}
              />

              {/* Message */}
              {g.message && (
                <div className="border-l-2 pl-4" style={{ borderColor: theme.from }}>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-2">Message</p>
                  <p className="text-white/70 font-mono text-sm leading-relaxed italic">
                    {g.message}
                  </p>
                </div>
              )}

              {/* Countdown / Status */}
              {status === 'pending' && (
                <div className={cn(
                  'border p-6',
                  ready ? 'border-[#FFE234]/30 bg-[#FFE234]/5' : 'border-white/[0.07]',
                )}>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-4">
                    {ready ? '● Ready to Claim' : '◌ Unlocks In'}
                  </p>
                  <CountdownTimer targetTs={g.birthdayTimestamp} large />
                </div>
              )}

              {status === 'claimed' && (
                <div className="border border-emerald-400/20 bg-emerald-400/5 p-6 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-emerald-400 font-mono text-[11px] uppercase tracking-widest">
                    This gift has been claimed!
                  </p>
                </div>
              )}

              {status === 'cancelled' && (
                <div className="border border-red-400/20 bg-red-400/5 p-6 text-center">
                  <p className="text-2xl mb-2">✕</p>
                  <p className="text-red-400 font-mono text-[11px] uppercase tracking-widest">
                    This gift was cancelled by the sender.
                  </p>
                </div>
              )}

              {/* Claim action */}
              {status === 'pending' && isRecipient && (
                <button
                  onClick={handleClaim}
                  disabled={!ready || loading}
                  className={cn(
                    'w-full py-5 text-[13px] font-mono uppercase tracking-widest font-black transition-colors',
                    ready && !loading
                      ? 'bg-[#FFE234] text-black hover:bg-[#FFE234]/90'
                      : 'bg-white/5 text-white/20 cursor-not-allowed',
                  )}
                >
                  {loading ? 'Processing…' : ready ? 'Claim Gift →' : 'Locked Until Birthday'}
                </button>
              )}

              {status === 'pending' && !isConnected && (
                <div className="border border-white/10 p-4 flex flex-col gap-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                    Connect wallet to claim
                  </p>
                  <ConnectButton />
                </div>
              )}

              {txHash && (
                <a
                  href={explorerTx(txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> View tx on ArcScan
                </a>
              )}
            </div>

            {/* Right — details */}
            <div className="flex flex-col gap-0 border border-white/[0.07]">
              {[
                { label: 'Amount',    value: amountDisplay,                  mono: true  },
                { label: 'From',      value: shortAddr(g.sender),            mono: true  },
                { label: 'To',        value: shortAddr(g.recipient),         mono: true  },
                { label: 'Birthday',  value: formatBirthday(g.birthdayTimestamp), mono: false },
                { label: 'Theme',     value: `${theme.emoji} ${theme.name}`, mono: false },
                { label: 'NFT Card',  value: `#${g.cardTokenId.toString()}`, mono: true, link: `${EXPLORER_URL}/token/${BIRTHDAY_CARD_ADDRESS}?a=${g.cardTokenId.toString()}` },
                { label: 'Recurring', value: g.recurring ? 'Yes — Annual' : 'No', mono: false },
                { label: 'Status',    value: status.charAt(0).toUpperCase() + status.slice(1), mono: false },
              ].map(({ label, value, mono, link }, i, arr) => (
                <div
                  key={label}
                  className={cn(
                    'px-4 py-3 flex flex-col gap-0.5',
                    i < arr.length - 1 && 'border-b border-white/[0.06]',
                  )}
                >
                  <p className="text-[9px] font-mono uppercase tracking-widest text-white/25">{label}</p>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        'text-sm flex items-center gap-1 hover:text-[#FFE234] transition-colors text-white/60',
                        mono && 'font-mono',
                      )}
                    >
                      {value} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className={cn('text-sm text-white/70', mono && 'font-mono')}>{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
