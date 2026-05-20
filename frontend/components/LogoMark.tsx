/**
 * BirthdayDrop brand identity.
 *
 * Concept: a gift-tag teardrop.
 *   — The teardrop silhouette  = "Drop"
 *   — The circular hole at top = a gift tag (string-hole)
 *   — The ribbon cross inside  = it's a birthday gift
 *
 * Reads clearly from 16 px (favicon) to 200 px+ (splash).
 */

interface MarkProps {
  size?: number
  /** Override fill for the teardrop body. Default: #FFE234 */
  color?: string
  /** Override color used for the cutouts (hole + ribbon). Default: #080808 */
  bg?: string
  className?: string
}

export function LogoMark({ size = 32, color = '#FFE234', bg = '#080808', className }: MarkProps) {
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
      {/* ── Gift-tag teardrop body ── */}
      <path
        d="M20 37
           C11 30 5 23 5 15
           C5 6.2 11.8 1 20 1
           C28.2 1 35 6.2 35 15
           C35 23 29 30 20 37 Z"
        fill={color}
      />

      {/* ── String hole (gift tag) ── */}
      <circle cx="20" cy="9.5" r="3.6" fill={bg} />

      {/* ── Ribbon — vertical ── */}
      <rect x="18.6" y="13" width="2.8" height="22" fill={bg} />

      {/* ── Ribbon — horizontal ── */}
      <rect x="7.5" y="20.5" width="25" height="2.8" fill={bg} />
    </svg>
  )
}

// ── Wordmark: mark + logotype side by side ─────────────────────────────────

interface WordmarkProps {
  size?: number
  className?: string
}

export function LogoWordmark({ size = 28, className }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark size={size} />
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

export function LogoDisplay({ size = 80 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <LogoMark size={size} />
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
