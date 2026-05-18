'use client'

import { THEMES, type Theme } from '@/lib/contracts'
import { cn } from '@/lib/utils'

interface Props {
  value:    number
  onChange: (theme: Theme) => void
}

export default function ThemeSelector({ value, onChange }: Props) {
  return (
    <div className="flex border border-white/10">
      {THEMES.map((theme, i) => (
        <button
          key={theme.id}
          type="button"
          title={theme.name}
          onClick={() => onChange(theme)}
          className={cn(
            'flex-1 flex flex-col items-center gap-2 py-3 transition-colors',
            i < THEMES.length - 1 && 'border-r border-white/10',
            value === theme.id
              ? 'bg-[#FFE234]/10'
              : 'hover:bg-white/[0.03]',
          )}
        >
          <span
            className="w-5 h-5 shrink-0"
            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
          />
          <span className={cn(
            'text-[9px] font-mono uppercase tracking-widest hidden sm:block',
            value === theme.id ? 'text-[#FFE234]' : 'text-white/25',
          )}>
            {theme.name}
          </span>
          <span className="sm:hidden text-base">{theme.emoji}</span>
        </button>
      ))}
    </div>
  )
}
