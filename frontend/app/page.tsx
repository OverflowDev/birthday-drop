'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import { LogoMark } from '@/components/LogoMark'

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(0, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(decimals ? parseFloat(v.toFixed(decimals)) : Math.round(v)),
    })
    return () => ctrl.stop()
  }, [inView, to, decimals])

  return <span ref={ref}>{decimals ? val.toFixed(decimals) : val.toLocaleString()}</span>
}

// ── Horizontal marquee ────────────────────────────────────────────────────────
function Marquee() {
  const ITEMS = 'SEND GIFTS · LOCK FUNDS · NFT CARDS · ARC CHAIN · USDC · EURC · SUB-SECOND · ON-CHAIN · '
  const repeated = ITEMS.repeat(6)
  return (
    <div className="overflow-hidden border-y border-white/[0.06] py-3.5 bg-[#FFE234]/[0.03]">
      <motion.p
        className="whitespace-nowrap text-[11px] font-mono tracking-[0.22em] text-white/25 will-change-transform"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {repeated}{repeated}
      </motion.p>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  { n: '01', glyph: '🎴', title: 'ON-CHAIN\nNFT CARD',      desc: 'Every gift mints a unique SVG card. No IPFS. Fully on-chain. Yours forever.' },
  { n: '02', glyph: '🛡',  title: 'STABLECOIN\nNATIVE',     desc: 'USDC or EURC. A $25 gift stays $25. No price volatility surprises.' },
  { n: '03', glyph: '🔁',  title: 'ANNUAL\nRECURRING',      desc: 'Mark it recurring. Get notified to refund it each year. Never miss one.' },
  { n: '04', glyph: '⚡',  title: 'SUB-SECOND\nFINALITY',  desc: 'Arc settles in ~0.48s. No reorgs. Gifts lock and unlock with certainty.' },
]

const STEPS = [
  { n: '01', title: 'Connect Wallet',   desc: 'Add Arc Testnet to MetaMask. Grab test USDC from the Circle faucet.' },
  { n: '02', title: 'Create a Gift',    desc: 'Pick recipient, token, amount, birthday date, theme and message.' },
  { n: '03', title: 'NFT Delivered',    desc: 'Gift card mints instantly to your recipient. Funds locked in vault.' },
  { n: '04', title: 'Birthday Arrives', desc: 'Recipient claims. Stablecoins transfer. Card updates to Claimed.' },
]

// ── Animation variants ────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const featRef  = useRef(null)
  const stepsRef = useRef(null)
  const featInView  = useInView(featRef,  { once: true, margin: '-60px' })
  const stepsInView = useInView(stepsRef, { once: true, margin: '-60px' })

  return (
    <div className="min-h-screen bg-[#080808] text-[#EFEFEF] font-sans selection:bg-[#FFE234] selection:text-black">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-svh flex flex-col justify-between px-5 sm:px-10 pt-24 pb-10 overflow-hidden">
        {/* Subtle grid bg */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Yellow glow */}
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FFE234]/10 blur-[120px] rounded-full -z-10" />

        {/* Logo mark + badge row */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoMark size={52} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-2 border border-white/10 w-fit px-3 py-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE234] animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.2em] text-white/40 uppercase">Live on Arc Testnet</span>
          </motion.div>
        </div>

        {/* Giant headline */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(3.8rem,16vw,13rem)] font-black leading-[0.9] tracking-tighter text-white uppercase"
              style={{
                textShadow: [
                  '1px 1px 0 #2e2e2e',
                  '2px 2px 0 #282828',
                  '3px 3px 0 #222',
                  '4px 4px 0 #1c1c1c',
                  '5px 5px 0 #181818',
                  '6px 6px 0 #141414',
                  '7px 7px 0 #101010',
                  '8px 8px 0 #0c0c0c',
                  '9px 9px 0 #0a0a0a',
                  '10px 10px 20px rgba(0,0,0,0.7)',
                ].join(', '),
              }}
            >
              Birthday
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.75, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(3.8rem,16vw,13rem)] font-black leading-[0.9] tracking-tighter uppercase text-[#FFE234]"
              style={{
                textShadow: [
                  '1px 1px 0 #d4ba00',
                  '2px 2px 0 #c4ab00',
                  '3px 3px 0 #b49c00',
                  '4px 4px 0 #a48d00',
                  '5px 5px 0 #947e00',
                  '6px 6px 0 #846f00',
                  '7px 7px 0 #746000',
                  '8px 8px 0 #645200',
                  '9px 9px 0 #544300',
                  '10px 10px 20px rgba(0,0,0,0.8)',
                ].join(', '),
              }}
            >
              Drop
            </motion.h1>
          </div>
        </div>

        {/* Subline + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="mt-10 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <p className="max-w-[260px] text-sm text-white/40 font-mono leading-relaxed">
            Time-locked stablecoin gifts.<br />
            On-chain NFT cards. Built on Arc.
          </p>
          <div className="flex flex-col xs:flex-row gap-3">
            <Link
              href="/create"
              className="group inline-flex items-center justify-center gap-3 bg-[#FFE234] text-black px-7 py-3.5 text-sm font-black uppercase tracking-wider hover:bg-white transition-colors duration-150"
            >
              Create a Gift
              <span className="group-hover:translate-x-1 transition-transform duration-150">→</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/50 px-7 py-3.5 text-sm font-bold uppercase tracking-wider hover:border-white/40 hover:text-white transition-colors duration-150"
            >
              Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-10 grid grid-cols-3 border-t border-white/[0.06]"
        >
          {[
            { label: 'Chain ID',  value: <Counter to={5042002} /> },
            { label: 'Avg Gas',   value: '~$0.01' },
            { label: 'Finality', value: <><Counter to={0.48} decimals={2} />s</> },
          ].map(({ label, value }) => (
            <div key={label} className="pt-5 pr-6 border-r border-white/[0.06] last:border-0 last:pl-6">
              <p className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums">{value}</p>
              <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-10 py-20 sm:py-28">
        <div className="mb-10 flex items-center gap-6">
          <span className="text-[11px] font-mono text-white/25 uppercase tracking-[0.3em]">What it does</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[11px] font-mono text-white/20">04</span>
        </div>

        <motion.div
          ref={featRef}
          variants={stagger}
          initial="hidden"
          animate={featInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]"
        >
          {FEATURES.map(({ n, glyph, title, desc }) => (
            <motion.div
              key={n}
              variants={fadeUp}
              whileHover={{ backgroundColor: 'rgba(255,226,52,0.05)' }}
              className="bg-[#080808] p-8 flex flex-col gap-5 cursor-default transition-colors duration-200 group"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono text-white/20">{n}</span>
                <span className="text-xl">{glyph}</span>
              </div>
              <h3 className="text-[13px] font-black text-white uppercase leading-snug whitespace-pre-line">
                {title}
              </h3>
              <p className="text-xs text-white/35 leading-relaxed mt-auto">{desc}</p>
              <div className="h-px w-0 bg-[#FFE234] group-hover:w-full transition-all duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-10 py-20 sm:py-28 border-t border-white/[0.06]">
        <div className="mb-10 flex items-center gap-6">
          <span className="text-[11px] font-mono text-white/25 uppercase tracking-[0.3em]">How it works</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[11px] font-mono text-white/20">04</span>
        </div>

        <motion.div
          ref={stepsRef}
          variants={stagger}
          initial="hidden"
          animate={stepsInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.07]"
        >
          {/* 01 — dark */}
          <motion.div variants={fadeUp} className="bg-[#080808] p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[260px] group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-mono text-white/25 uppercase tracking-widest">Step</span>
              <span className="text-[80px] sm:text-[100px] font-black font-mono text-white/[0.04] leading-none select-none group-hover:text-white/[0.07] transition-colors duration-300">01</span>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase leading-none mb-3">
                Connect<br />Wallet
              </h3>
              <p className="text-xs text-white/35 leading-relaxed max-w-xs">
                Add Arc Testnet to MetaMask. Grab test USDC from the Circle faucet. Takes 60 seconds.
              </p>
            </div>
          </motion.div>

          {/* 02 — yellow highlight */}
          <motion.div variants={fadeUp} className="bg-[#FFE234] p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[260px] group cursor-default">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-mono text-black/40 uppercase tracking-widest">Step</span>
              <span className="text-[80px] sm:text-[100px] font-black font-mono text-black/[0.06] leading-none select-none">02</span>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-black uppercase leading-none mb-3">
                Create<br />a Gift
              </h3>
              <p className="text-xs text-black/50 leading-relaxed max-w-xs">
                Pick recipient, token, amount, birthday date, NFT theme and a message. All on-chain.
              </p>
            </div>
          </motion.div>

          {/* 03 — dark with yellow border accent */}
          <motion.div variants={fadeUp} className="bg-[#080808] border-t-2 border-t-[#FFE234]/20 p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[260px] group cursor-default hover:border-t-[#FFE234]/60 transition-colors duration-200">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-mono text-white/25 uppercase tracking-widest">Step</span>
              <span className="text-[80px] sm:text-[100px] font-black font-mono text-white/[0.04] leading-none select-none group-hover:text-white/[0.07] transition-colors duration-300">03</span>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase leading-none mb-3">
                NFT<br />Delivered
              </h3>
              <p className="text-xs text-white/35 leading-relaxed max-w-xs">
                A gift card NFT mints instantly to your recipient. Funds locked in vault. Sub-second.
              </p>
            </div>
          </motion.div>

          {/* 04 — dark with corner badge */}
          <motion.div variants={fadeUp} className="bg-[#0e0e0e] p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[260px] group cursor-default relative overflow-hidden hover:bg-white/[0.02] transition-colors duration-200">
            {/* Top-right corner yellow accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFE234] flex items-end justify-start p-2">
              <span className="text-[10px] font-black text-black uppercase leading-none">Claim</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-mono text-white/25 uppercase tracking-widest">Step</span>
              <span className="text-[80px] sm:text-[100px] font-black font-mono text-white/[0.04] leading-none select-none group-hover:text-white/[0.07] transition-colors duration-300 mr-14">04</span>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase leading-none mb-3">
                Birthday<br />Arrives
              </h3>
              <p className="text-xs text-white/35 leading-relaxed max-w-xs">
                Recipient clicks Claim. Stablecoins transfer instantly. Card updates to Claimed. Done.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-10 py-20 sm:py-28 border-t border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="border border-white/10 p-8 sm:p-14 lg:p-20 flex flex-col sm:flex-row sm:items-center justify-between gap-10 relative overflow-hidden"
        >
          {/* Corner accent */}
          <div aria-hidden className="absolute top-0 right-0 w-40 h-40 bg-[#FFE234]/[0.04] -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col gap-6">
            <LogoMark size={48} />
            <div>
              <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.3em] mb-4">Get started</p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                Send your<br />first gift.
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <Link
              href="/create"
              className="group inline-flex items-center justify-center gap-4 bg-[#FFE234] text-black px-8 py-4 text-sm font-black uppercase tracking-wider hover:bg-white transition-colors duration-150"
            >
              Create a Gift
              <span className="group-hover:translate-x-1 transition-transform duration-150">→</span>
            </Link>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noreferrer"
              className="text-center text-[11px] font-mono text-white/25 hover:text-white/50 transition-colors uppercase tracking-wider"
            >
              Get test USDC ↗
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-5 sm:px-10 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-[11px] font-mono text-white/20 uppercase tracking-wider">
            Birthday Drop © 2025
          </span>
          <nav className="flex gap-6">
            {[
              { label: 'ArcScan',  href: 'https://testnet.arcscan.app' },
              { label: 'Arc Docs', href: 'https://docs.arc.io'         },
              { label: 'Faucet',   href: 'https://faucet.circle.com'   },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-white/20 hover:text-white/50 uppercase tracking-wider transition-colors"
              >
                {label} ↗
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
