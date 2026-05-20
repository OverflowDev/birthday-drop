'use client'

import { useReadContracts } from 'wagmi'
import { ExternalLink } from 'lucide-react'
import { BIRTHDAY_CARD_ABI } from '@/lib/abi'
import { BIRTHDAY_CARD_ADDRESS, EXPLORER_URL, SUPPORTED_TOKENS, THEMES } from '@/lib/contracts'
import { cn, formatTokenAmount, formatBirthday, giftIdToSlug } from '@/lib/utils'

type GiftData = {
  id:                bigint
  cardTokenId:       bigint
  amount:            bigint
  token:             `0x${string}`
  birthdayTimestamp: bigint
  theme:             number
  claimed:           boolean
  cancelled:         boolean
  sender:            `0x${string}`
}

function parseTokenURI(uri: string) {
  try {
    const json = JSON.parse(atob(uri.replace('data:application/json;base64,', '')))
    return json as { image: string; name: string; attributes: { trait_type: string; value: string }[] }
  } catch {
    return null
  }
}

export default function NFTGallery({ gifts }: { gifts: GiftData[] }) {
  const { data: uriResults } = useReadContracts({
    contracts: gifts.map(g => ({
      address:      BIRTHDAY_CARD_ADDRESS,
      abi:          BIRTHDAY_CARD_ABI,
      functionName: 'tokenURI' as const,
      args:         [g.cardTokenId] as const,
    })),
    query: { enabled: gifts.length > 0 },
  })

  if (gifts.length === 0) return null

  return (
    <div className="mt-2 border-t border-white/[0.07] pt-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-2 h-2 bg-[#FFE234]" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          My NFT Cards — {gifts.length}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((gift, i) => {
          const result = uriResults?.[i]
          const parsed = result?.status === 'success'
            ? parseTokenURI(result.result as string)
            : null

          const token  = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === gift.token.toLowerCase())
          const theme  = THEMES[gift.theme % 5]
          const status = gift.claimed ? 'claimed' : gift.cancelled ? 'cancelled' : 'pending'

          return (
            <div
              key={gift.cardTokenId.toString()}
              className={cn(
                'border border-white/[0.07] flex flex-col bg-[#080808] overflow-hidden',
                status === 'cancelled' && 'opacity-50',
              )}
              style={{ borderTopColor: theme.from, borderTopWidth: 2 }}
            >
              {/* SVG artwork */}
              <div className="w-full bg-black/30">
                {parsed ? (
                  <img
                    src={parsed.image}
                    alt={parsed.name ?? `Gift Card #${gift.cardTokenId}`}
                    className="w-full h-auto block"
                  />
                ) : (
                  <div className="w-full aspect-[400/260] flex items-center justify-center">
                    <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Info strip */}
              <div className="px-3 py-2.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/25">
                    #{gift.cardTokenId.toString().padStart(6, '0')} · {giftIdToSlug(gift.id)}
                  </span>
                  <span className={cn(
                    'text-[9px] font-mono uppercase tracking-widest',
                    status === 'claimed'   && 'text-emerald-400',
                    status === 'cancelled' && 'text-red-400',
                    status === 'pending'   && 'text-[#FFE234]/70',
                  )}>
                    {status === 'claimed' ? '✓ Claimed' : status === 'cancelled' ? '✕ Cancelled' : '◌ Pending'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-white tabular-nums leading-none">
                      {formatTokenAmount(gift.amount)}
                    </span>
                    <span className="text-[11px] font-mono text-white/40">{token?.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/25">
                      {formatBirthday(gift.birthdayTimestamp)}
                    </span>
                    <a
                      href={`${EXPLORER_URL}/token/${BIRTHDAY_CARD_ADDRESS}?a=${gift.cardTokenId.toString()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/20 hover:text-[#FFE234] transition-colors"
                      title="View on ArcScan"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
