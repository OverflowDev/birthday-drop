'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import toast from 'react-hot-toast'
import { ExternalLink, RefreshCw, Share2 } from 'lucide-react'
import { BIRTHDAY_DROP_ABI } from '@/lib/abi'
import { BIRTHDAY_DROP_ADDRESS, BIRTHDAY_CARD_ADDRESS, SUPPORTED_TOKENS, THEMES, EXPLORER_URL } from '@/lib/contracts'
import { shortAddr, formatTokenAmount, formatBirthday, isBirthdayPassed, explorerTx, giftIdToSlug } from '@/lib/utils'
import { cn } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

type GiftData = {
  id:                bigint
  sender:            `0x${string}`
  recipient:         `0x${string}`
  token:             `0x${string}`
  amount:            bigint
  birthdayTimestamp: bigint
  message:           string
  theme:             number
  recurring:         boolean
  cardTokenId:       bigint
  claimed:           boolean
  cancelled:         boolean
  createdAt:         bigint
}

interface Props {
  gift:    GiftData
  mode:    'sent' | 'received'
  onDone?: () => void
}

export default function GiftItem({ gift, mode, onDone }: Props) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const { writeContractAsync, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (txConfirmed) {
      toast.success('Transaction confirmed!')
      onDone?.()
    }
  }, [txConfirmed])

  const token   = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === gift.token.toLowerCase())
  const theme   = THEMES[gift.theme % 5]
  const ready   = isBirthdayPassed(gift.birthdayTimestamp)
  const loading = isPending || isConfirming

  const status: 'claimed' | 'cancelled' | 'pending' =
    gift.claimed ? 'claimed' : gift.cancelled ? 'cancelled' : 'pending'

  async function handleClaim() {
    try {
      const hash = await writeContractAsync({
        address: BIRTHDAY_DROP_ADDRESS,
        abi:     BIRTHDAY_DROP_ABI,
        functionName: 'claimGift',
        args:    [gift.id],
      })
      setTxHash(hash)
      toast.success('Claim tx sent!')
    } catch (e: any) {
      toast.error(e.shortMessage ?? e.message ?? 'Transaction failed')
    }
  }

  async function handleCancel() {
    try {
      const hash = await writeContractAsync({
        address: BIRTHDAY_DROP_ADDRESS,
        abi:     BIRTHDAY_DROP_ABI,
        functionName: 'cancelGift',
        args:    [gift.id],
      })
      setTxHash(hash)
      toast.success('Cancel tx sent!')
    } catch (e: any) {
      toast.error(e.shortMessage ?? e.message ?? 'Transaction failed')
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/gift/${giftIdToSlug(gift.id)}`
    navigator.clipboard.writeText(url).then(() => toast.success('Gift link copied!'))
  }

  const nftUrl = `${EXPLORER_URL}/token/${BIRTHDAY_CARD_ADDRESS}?a=${gift.cardTokenId.toString()}`

  return (
    <div
      className={cn(
        'border border-white/[0.07] bg-[#080808] flex flex-col',
        status === 'claimed'   && 'opacity-50',
        status === 'cancelled' && 'opacity-40',
      )}
      style={{ borderLeftColor: theme.from, borderLeftWidth: 3 }}
    >
      {/* Status strip */}
      <div className={cn(
        'px-4 py-1.5 flex items-center justify-between border-b border-white/[0.06]',
        status === 'claimed'            && 'bg-emerald-400/5',
        status === 'cancelled'          && 'bg-red-400/5',
        status === 'pending' && ready   && 'bg-[#FFE234]/5',
      )}>
        <span className={cn(
          'text-[9px] font-mono uppercase tracking-[0.2em]',
          status === 'claimed'            && 'text-emerald-400',
          status === 'cancelled'          && 'text-red-400',
          status === 'pending' && ready   && 'text-[#FFE234]',
          status === 'pending' && !ready  && 'text-white/30',
        )}>
          {status === 'claimed'   && '✓ Claimed'}
          {status === 'cancelled' && '✕ Cancelled'}
          {status === 'pending' && ready  && '● Ready to Claim'}
          {status === 'pending' && !ready && '◌ Locked'}
        </span>
        <div className="flex items-center gap-3">
          {gift.recurring && (
            <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-[#FFE234]/60">
              <RefreshCw className="w-2.5 h-2.5" /> Annual
            </span>
          )}
          <span className="text-[9px] font-mono text-white/20">{theme.emoji} {theme.name}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Amount */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-0.5">
            {mode === 'received' ? 'You receive' : 'You sent'}
          </p>
          <p className="text-2xl font-black text-white leading-none tabular-nums">
            {formatTokenAmount(gift.amount)}
            <span className="text-sm font-mono text-white/40 ml-1.5">{token?.symbol ?? '?'}</span>
          </p>
        </div>

        {/* Message */}
        {gift.message && (
          <p className="text-white/50 text-xs font-mono leading-relaxed line-clamp-2 border-l-2 border-white/10 pl-3 italic">
            {gift.message}
          </p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-0.5">
              {mode === 'received' ? 'From' : 'To'}
            </p>
            <p className="text-white/60 font-mono text-[11px]">
              {shortAddr(mode === 'received' ? gift.sender : gift.recipient)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-0.5">Birthday</p>
            <p className="text-white/60 font-mono text-[11px]">{formatBirthday(gift.birthdayTimestamp)}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-0.5">Gift #</p>
            <p className="text-white/60 font-mono text-[11px]">{giftIdToSlug(gift.id)}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-0.5">NFT Card</p>
            <a
              href={nftUrl}
              target="_blank"
              rel="noreferrer"
              className="text-white/40 font-mono text-[11px] flex items-center gap-1 hover:text-[#FFE234] transition-colors"
            >
              #{gift.cardTokenId.toString().padStart(6, '0')} <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="col-span-2 border-t border-white/[0.04] pt-2 mt-1">
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-0.5">
              {mode === 'received' ? 'Received on' : 'Sent on'}
            </p>
            <p className="text-white/40 font-mono text-[11px]">{formatBirthday(gift.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Countdown */}
      {status === 'pending' && (
        <div className="border-t border-white/[0.06] px-4 py-2.5">
          <CountdownTimer targetTs={gift.birthdayTimestamp} />
        </div>
      )}

      {/* Actions */}
      {status === 'pending' && (
        <div className="border-t border-white/[0.06] flex">
          <button
            onClick={handleShare}
            title="Copy gift link"
            className="px-4 py-3 border-r border-white/[0.06] text-white/25 hover:text-white/60 hover:bg-white/[0.03] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {mode === 'received' ? (
            <button
              onClick={handleClaim}
              disabled={!ready || loading}
              className={cn(
                'flex-1 py-3 text-[11px] font-mono uppercase tracking-widest font-bold transition-colors',
                ready && !loading
                  ? 'bg-[#FFE234] text-black hover:bg-[#FFE234]/90'
                  : 'text-white/20 cursor-not-allowed',
              )}
            >
              {loading ? 'Claiming…' : ready ? 'Claim →' : 'Locked'}
            </button>
          ) : (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-3 text-[11px] font-mono uppercase tracking-widest text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-colors disabled:opacity-30"
            >
              {loading ? 'Cancelling…' : 'Cancel Gift'}
            </button>
          )}
        </div>
      )}

      {/* TX link */}
      {txHash && (
        <a
          href={explorerTx(txHash)}
          target="_blank"
          rel="noreferrer"
          className="border-t border-white/[0.06] px-4 py-2 flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> View tx on ArcScan
        </a>
      )}
    </div>
  )
}
