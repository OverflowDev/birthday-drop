'use client'

import { SUPPORTED_TOKENS, type SupportedToken } from '@/lib/contracts'
import { cn } from '@/lib/utils'

interface Props {
  value:    `0x${string}`
  onChange: (token: SupportedToken) => void
}

export default function TokenSelector({ value, onChange }: Props) {
  return (
    <div className="flex border border-white/10">
      {SUPPORTED_TOKENS.map((token, i) => (
        <button
          key={token.address}
          type="button"
          onClick={() => onChange(token)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-mono uppercase tracking-widest transition-colors',
            i < SUPPORTED_TOKENS.length - 1 && 'border-r border-white/10',
            value === token.address
              ? 'bg-[#FFE234] text-black'
              : 'text-white/40 hover:text-white hover:bg-white/[0.03]',
          )}
        >
          <span>{token.flag}</span>
          <span>{token.symbol}</span>
        </button>
      ))}
    </div>
  )
}
