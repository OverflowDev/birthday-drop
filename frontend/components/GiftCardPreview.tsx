'use client'

import { THEMES } from '@/lib/contracts'
import { shortAddr, formatTokenAmount } from '@/lib/utils'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  sender:    string
  recipient: string
  amount:    string
  symbol:    string
  message:   string
  birthday:  Date | null
  themeId:   number
  status?:   'pending' | 'claimed' | 'cancelled'
}

const THEME_DARK = [false, false, false, true, false]

export default function GiftCardPreview({
  sender, recipient, amount, symbol, message, birthday, themeId, status = 'pending'
}: Props) {
  const theme        = THEMES[themeId] ?? THEMES[0]
  const isDark       = THEME_DARK[themeId] ?? false
  const textColor    = isDark ? 'text-white'     : 'text-gray-900'
  const subColor     = isDark ? 'text-white/50'  : 'text-gray-500'
  const dividerColor = isDark ? 'border-white/10' : 'border-gray-200'

  const displayAmount = amount ? `${amount} ${symbol}` : `0.00 ${symbol}`
  const displayMsg    = message.slice(0, 50) || 'Your birthday message…'
  const displayDate   = birthday ? format(birthday, 'MMM d, yyyy') : '—'

  const statusLabel =
    status === 'claimed'   ? 'CLAIMED'   :
    status === 'cancelled' ? 'CANCELLED' : null

  const statusColor =
    status === 'claimed'   ? 'text-emerald-500' :
    status === 'cancelled' ? 'text-red-500'     : ''

  return (
    <div className="relative w-full aspect-[400/260] overflow-hidden shadow-2xl">
      {/* Gradient bg */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      />
      {/* Frosted inner */}
      <div className={cn(
        'absolute inset-[3px] flex flex-col justify-between p-5',
        isDark ? 'bg-black/50 backdrop-blur-md' : 'bg-white/90',
      )}>
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <p className={cn('text-[9px] font-mono uppercase tracking-[0.2em] mb-1.5', subColor)}>
              Birthday Drop · Arc
            </p>
            <p className={cn('text-2xl font-black leading-none tabular-nums', textColor)}>
              {displayAmount}
            </p>
          </div>
          {/* Theme swatch */}
          <div
            className="w-8 h-8 shrink-0"
            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, opacity: 0.6 }}
          />
        </div>

        {/* Message */}
        <p className={cn('text-[11px] font-mono leading-snug line-clamp-2', subColor)}>
          {displayMsg}
        </p>

        {/* Footer */}
        <div className={cn('border-t pt-3', dividerColor)}>
          <div className="flex items-end justify-between">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1">
              <div>
                <p className={cn('text-[8px] font-mono uppercase tracking-widest mb-0.5', subColor)}>From</p>
                <p className={cn('text-[10px] font-mono', textColor)}>
                  {sender ? shortAddr(sender) : '0x...'}
                </p>
              </div>
              <div>
                <p className={cn('text-[8px] font-mono uppercase tracking-widest mb-0.5', subColor)}>To</p>
                <p className={cn('text-[10px] font-mono', textColor)}>
                  {recipient ? shortAddr(recipient) : '0x...'}
                </p>
              </div>
            </div>
            <div className="text-right">
              {statusLabel ? (
                <p className={cn('text-[9px] font-mono font-black uppercase tracking-widest', statusColor)}>
                  {statusLabel}
                </p>
              ) : (
                <p className={cn('text-[9px] font-mono uppercase tracking-widest', subColor)}>
                  {displayDate}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
      />
    </div>
  )
}
