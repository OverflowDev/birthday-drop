'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import GiftItem from './GiftItem'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 6

interface Props {
  label:     string
  dot?:      'yellow' | 'dim' | 'faint'
  gifts:     any[]
  mode:      'sent' | 'received'
  onDone:    () => void
  wrapClass?: string
}

export default function GiftSection({ label, dot = 'dim', gifts, mode, onDone, wrapClass }: Props) {
  const [page, setPage] = useState(0)

  if (gifts.length === 0) return null

  const totalPages = Math.ceil(gifts.length / PAGE_SIZE)
  const paginated  = gifts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const dotColor =
    dot === 'yellow' ? 'bg-[#FFE234] animate-pulse' :
    dot === 'dim'    ? 'border border-white/20'      :
                       'bg-white/10'

  const labelColor =
    dot === 'yellow' ? 'text-[#FFE234]' :
    dot === 'dim'    ? 'text-white/40'  :
                       'text-white/20'

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={cn('w-2 h-2', dotColor)} />
          <span className={cn('text-[10px] font-mono uppercase tracking-widest', labelColor)}>
            {label} — {gifts.length} gift{gifts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 border border-white/[0.07] text-white/55 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1 border border-white/[0.07] text-white/55 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className={cn('grid sm:grid-cols-2 lg:grid-cols-3 gap-px', wrapClass)}>
        {paginated.map((g: any) => (
          <GiftItem key={g.id.toString()} gift={g} mode={mode} onDone={onDone} />
        ))}
      </div>
    </div>
  )
}
