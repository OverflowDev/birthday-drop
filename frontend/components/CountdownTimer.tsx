'use client'

import { useEffect, useState } from 'react'

interface Props {
  targetTs:  bigint
  onExpired?: () => void
  large?:     boolean
}

interface TimeLeft {
  days:    number
  hours:   number
  minutes: number
  seconds: number
}

function compute(targetTs: bigint): TimeLeft | null {
  const diff = Number(targetTs) * 1000 - Date.now()
  if (diff <= 0) return null
  const s = Math.floor(diff / 1000)
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export default function CountdownTimer({ targetTs, onExpired, large = false }: Props) {
  const [left, setLeft] = useState<TimeLeft | null>(() => compute(targetTs))

  useEffect(() => {
    const interval = setInterval(() => {
      const next = compute(targetTs)
      setLeft(next)
      if (!next) {
        clearInterval(interval)
        onExpired?.()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [targetTs, onExpired])

  if (!left) {
    return (
      <span className={`text-[#FFE234] font-mono uppercase tracking-widest font-black ${large ? 'text-sm' : 'text-[10px]'}`}>
        ● Ready to Claim
      </span>
    )
  }

  if (large) {
    return (
      <div className="flex items-end gap-px">
        {left.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black font-mono text-white tabular-nums">{pad(left.days)}</span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/55 mt-1">days</span>
            </div>
            <span className="text-2xl font-black text-white/20 mb-5 mx-1">:</span>
          </>
        )}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-black font-mono text-white tabular-nums">{pad(left.hours)}</span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/55 mt-1">hrs</span>
        </div>
        <span className="text-2xl font-black text-white/20 mb-5 mx-1">:</span>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-black font-mono text-white tabular-nums">{pad(left.minutes)}</span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/55 mt-1">min</span>
        </div>
        <span className="text-2xl font-black text-white/20 mb-5 mx-1">:</span>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-black font-mono text-[#FFE234] tabular-nums">{pad(left.seconds)}</span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/55 mt-1">sec</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest">
      {left.days > 0 && (
        <span className="text-white/50">{pad(left.days)}d</span>
      )}
      <span className="text-white/70 tabular-nums">{pad(left.hours)}</span>
      <span className="text-white/20">:</span>
      <span className="text-white/70 tabular-nums">{pad(left.minutes)}</span>
      <span className="text-white/20">:</span>
      <span className="text-[#FFE234] tabular-nums">{pad(left.seconds)}</span>
    </div>
  )
}
