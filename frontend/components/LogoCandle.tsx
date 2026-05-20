/**
 * BirthdayDrop — alternate brand mark.
 *
 * Concept: a birthday candle.
 *   — The candle body    = "Birthday" (celebration, ritual, every year)
 *   — The flame shape    = an upward teardrop (mirror of the gift-tag mark)
 *   — The wax drip       = personality; funds "melting" into the gift
 *   — White inner flame  = the lit wick / on-chain spark
 *
 * Intentional contrast with LogoMark:
 *   LogoMark  → teardrop pointing DOWN  (gift tag, liquid drop, gravity)
 *   CandleMark → teardrop pointing UP   (flame, energy, celebration)
 */

interface MarkProps {
  size?:  number
  /** Candle + flame body colour. Default: #FFE234 */
  color?: string
  /** Wick + wax drip overlay colour. Default: #080808 */
  bg?:    string
  className?: string
}

export function CandleMark({ size = 32, color = '#FFE234', bg = '#080808', className }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="BirthdayDrop"
      className={className}
    >
      {/* ── Candle body ── */}
      <rect x="15" y="21" width="10" height="16" fill={color} />

      {/* ── Wax drip (left side) ── */}
      <path
        d="M15 26 Q11.5 28.5 11.5 31.5 Q11.5 34 15 34 Z"
        fill={color}
        opacity="0.45"
      />

      {/* ── Wick ── */}
      <rect x="19.4" y="18.5" width="1.2" height="3" fill={bg} opacity="0.7" />

      {/* ── Flame outer (upward teardrop) ── */}
      <path
        d="M20 18.5
           C12 18.5 10 12.5 12.5 8
           C14 4 20 2 20 2
           C20 2 26 4 27.5 8
           C30 12.5 28 18.5 20 18.5Z"
        fill={color}
      />

      {/* ── Flame inner (white glow core) ── */}
      <path
        d="M20 16
           C16 16 14.5 12 16 9
           C17 6 20 4.5 20 4.5
           C20 4.5 23 6 24 9
           C25.5 12 24 16 20 16Z"
        fill="white"
        opacity="0.55"
      />
    </svg>
  )
}

// ── Wordmark ────────────────────────────────────────────────────────────────

interface WordmarkProps {
  size?:      number
  className?: string
}

export function CandleWordmark({ size = 28, className }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <CandleMark size={size} />
      <span
        style={{ fontSize: size * 0.43, letterSpacing: '-0.02em' }}
        className="font-black uppercase text-white leading-none"
      >
        Birthday<span className="text-[#FFE234]">Drop</span>
      </span>
    </span>
  )
}

// ── Display (hero / splash) ──────────────────────────────────────────────────

export function CandleDisplay({ size = 80 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <CandleMark size={size} />
      <div className="text-center">
        <p
          style={{ fontSize: size * 0.22, letterSpacing: '-0.03em' }}
          className="font-black uppercase text-white leading-none"
        >
          Birthday<span className="text-[#FFE234]">Drop</span>
        </p>
        <p
          style={{ fontSize: size * 0.1 }}
          className="font-mono uppercase tracking-[0.25em] text-white/40 mt-1"
        >
          On Arc
        </p>
      </div>
    </div>
  )
}
