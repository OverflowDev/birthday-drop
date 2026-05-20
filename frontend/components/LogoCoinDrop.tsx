/**
 * BirthdayDrop — primary brand mark.
 *
 * Concept: a stablecoin falling into a gift box.
 *   — The coin    = USDC/EURC (the token being gifted)
 *   — The trail   = the "drop" — funds in motion
 *   — The gift    = the birthday present (lid, ribbon, bow)
 *
 * Reads cleanly from 16 px (favicon) to 200 px+ (hero).
 */

interface MarkProps {
  size?: number
  /** Gift box + coin body fill. Default: #FFE234 */
  color?: string
  /** Ribbon, coin ring, and cutout color. Default: #080808 */
  bg?: string
  className?: string
}

export function CoinDropMark({ size = 32, color = '#FFE234', bg = '#080808', className }: MarkProps) {
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
      {/* ── Gift body ── */}
      <rect x="7" y="24" width="26" height="14" rx="1.5" fill={color} />

      {/* ── Gift lid (slightly wider) ── */}
      <rect x="5" y="19" width="30" height="5" rx="1.5" fill={color} />

      {/* ── Ribbon (vertical) ── */}
      <rect x="18.5" y="19" width="3" height="19" fill={bg} />

      {/* ── Bow left loop ── */}
      <path d="M18.5 20 C18.5 17 11 15.5 11 18.5 C11 21.5 16 22 18.5 20Z" fill={bg} />

      {/* ── Bow right loop ── */}
      <path d="M21.5 20 C21.5 17 29 15.5 29 18.5 C29 21.5 24 22 21.5 20Z" fill={bg} />

      {/* ── Bow knot ── */}
      <circle cx="20" cy="20" r="2" fill={color} />
      <circle cx="20" cy="20" r="1" fill={bg} />

      {/* ── Motion trail (coin dropping) ── */}
      <circle cx="20" cy="12" r="1.1" fill={color} opacity="0.65" />
      <circle cx="20" cy="14" r="0.7" fill={color} opacity="0.35" />

      {/* ── Coin body ── */}
      <circle cx="20" cy="6" r="4" fill={color} />

      {/* ── Coin inner ring (token detail) ── */}
      <circle cx="20" cy="6" r="2.5" fill="none" stroke={bg} strokeWidth="1.3" />
    </svg>
  )
}

// ── Wordmark: mark + logotype side by side ─────────────────────────────────

interface WordmarkProps {
  size?: number
  className?: string
}

export function CoinDropWordmark({ size = 28, className }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <CoinDropMark size={size} />
      <span
        style={{ fontSize: size * 0.43, letterSpacing: '-0.02em' }}
        className="font-black uppercase text-white leading-none"
      >
        Birthday<span className="text-[#FFE234]">Drop</span>
      </span>
    </span>
  )
}

// ── Large display version (hero / splash) ─────────────────────────────────

export function CoinDropDisplay({ size = 80 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <CoinDropMark size={size} />
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
