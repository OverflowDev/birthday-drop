'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { maxUint256 } from 'viem'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast, { Toaster } from 'react-hot-toast'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ExternalLink, ArrowRight, RefreshCw, Lock } from 'lucide-react'
import Link from 'next/link'

import Header from '@/components/Header'
import TokenSelector from '@/components/TokenSelector'
import ThemeSelector from '@/components/ThemeSelector'
import GiftCardPreview from '@/components/GiftCardPreview'

import { BIRTHDAY_DROP_ABI, ERC20_ABI } from '@/lib/abi'
import {
  BIRTHDAY_DROP_ADDRESS,
  SUPPORTED_TOKENS,
  THEMES,
  type SupportedToken,
  type Theme,
} from '@/lib/contracts'
import { parseTokenAmount, explorerTx, cn } from '@/lib/utils'

const MIN_DATE = new Date(Date.now() + 60 * 60 * 1000)

const LABEL = 'text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-2'
const INPUT = 'w-full bg-transparent border border-white/10 px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-[#FFE234]/50 transition-colors'

export default function CreatePage() {
  const { address, isConnected } = useAccount()

  const [recipient,  setRecipient ] = useState('')
  const [amount,     setAmount    ] = useState('')
  const [message,    setMessage   ] = useState('')
  const [birthday,   setBirthday  ] = useState<Date | null>(null)
  const [recurring,  setRecurring ] = useState(false)
  const [token,      setToken     ] = useState<SupportedToken>(SUPPORTED_TOKENS[0])
  const [themeId,    setThemeId   ] = useState(0)
  const [successHash, setSuccessHash] = useState('')

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token.address,
    abi:     ERC20_ABI,
    functionName: 'allowance',
    args:    [address!, BIRTHDAY_DROP_ADDRESS],
    query:   { enabled: !!address },
  })

  const { data: tokenBalance } = useReadContract({
    address: token.address,
    abi:     ERC20_ABI,
    functionName: 'balanceOf',
    args:    [address!],
    query:   { enabled: !!address },
  })

  const { writeContractAsync, isPending } = useWriteContract()

  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>()
  const [createTxHash,  setCreateTxHash ] = useState<`0x${string}` | undefined>()

  const { isLoading: isApproving, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isLoading: isCreating } =
    useWaitForTransactionReceipt({ hash: createTxHash })

  useEffect(() => {
    if (approveSuccess) {
      toast.dismiss('approve')
      toast.success('Approved! Now create the gift.')
      refetchAllowance()
    }
  }, [approveSuccess])

  const amountBig    = amount ? parseTokenAmount(amount) : 0n
  const needsApprove = (allowance ?? 0n) < amountBig

  const isValid =
    recipient.startsWith('0x') &&
    recipient.length === 42 &&
    amountBig > 0n &&
    !!birthday &&
    birthday > new Date()

  const isLoading = isPending || isApproving || isCreating

  const step = !isConnected ? 0 : needsApprove ? 1 : 2

  async function handleApprove() {
    try {
      const hash = await writeContractAsync({
        address: token.address,
        abi:     ERC20_ABI,
        functionName: 'approve',
        args:    [BIRTHDAY_DROP_ADDRESS, maxUint256],
      })
      setApproveTxHash(hash)
      toast.loading('Approving token spend…', { id: 'approve' })
    } catch (e: any) {
      toast.error(e.shortMessage ?? e.message ?? 'Approval failed')
    }
  }

  async function handleCreate() {
    if (!isValid || !birthday) return
    try {
      const ts   = BigInt(Math.floor(birthday.getTime() / 1000))
      const hash = await writeContractAsync({
        address: BIRTHDAY_DROP_ADDRESS,
        abi:     BIRTHDAY_DROP_ABI,
        functionName: 'createGift',
        args: [
          recipient as `0x${string}`,
          token.address,
          amountBig,
          ts,
          message.slice(0, 200),
          themeId,
          recurring,
        ],
      })
      setCreateTxHash(hash)
      setSuccessHash(hash)
      toast.success('Gift created! NFT minted to recipient.')
    } catch (e: any) {
      toast.error(e.shortMessage ?? e.message ?? 'Transaction failed')
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (successHash) {
    return (
      <div className="min-h-screen bg-[#080808] text-white">
        <Header />
        <div className="pt-32 pb-20 px-5 flex flex-col items-center text-center gap-8">
          <div className="border border-[#FFE234]/30 inline-flex items-center gap-3 px-6 py-3">
            <span className="w-2 h-2 bg-[#FFE234] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#FFE234]">Gift Sent Successfully</span>
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tight mb-3">
              Gift<br />
              <span className="text-[#FFE234]">Locked.</span>
            </h1>
            <p className="text-white/40 text-sm font-mono max-w-sm">
              The NFT card is minted to your recipient. Funds are time-locked until their birthday.
            </p>
          </div>
          <a
            href={explorerTx(successHash)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-white/30 hover:text-white/70 border-b border-white/10 hover:border-white/30 pb-0.5 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> View on ArcScan
          </a>
          <div className="flex gap-0 border border-white/10">
            <button
              onClick={() => {
                setSuccessHash('')
                setRecipient('')
                setAmount('')
                setMessage('')
                setBirthday(null)
              }}
              className="px-8 py-3 text-[11px] font-mono uppercase tracking-widest bg-[#FFE234] text-black border-r border-white/10 hover:bg-[#FFE234]/90 transition-colors"
            >
              Send Another
            </button>
            <Link
              href="/dashboard"
              className="px-8 py-3 text-[11px] font-mono uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Header />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 0,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
          },
        }}
      />

      <div className="pt-24 pb-20 px-5 sm:px-10">
        <div className="mx-auto max-w-6xl">

          {/* Page header */}
          <div className="border-b border-white/[0.07] pb-6 mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">Create</p>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none">
                Birthday<br />
                <span className="text-[#FFE234]">Gift</span>
              </h1>
            </div>
            {/* Step indicator */}
            <div className="flex items-center gap-0 border border-white/10">
              {[
                { n: '01', label: 'Approve' },
                { n: '02', label: 'Create'  },
              ].map(({ n, label }, i) => (
                <div
                  key={n}
                  className={cn(
                    'px-5 py-2.5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest',
                    i < 1 && 'border-r border-white/10',
                    step > i
                      ? 'text-[#FFE234]'
                      : step === i + 1
                        ? 'text-white'
                        : 'text-white/20',
                  )}
                >
                  <span className={cn(
                    'font-black',
                    step > i && 'line-through opacity-50',
                  )}>{n}</span>
                  <span>{label}</span>
                  {step > i && <span className="text-[#FFE234]">✓</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-0 lg:gap-10 items-start">

            {/* ─── Form ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-8">

              {/* Recipient */}
              <div>
                <label className={LABEL}>Recipient Address</label>
                <input
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="0x..."
                  spellCheck={false}
                  className={INPUT}
                />
              </div>

              {/* Token */}
              <div>
                <label className={LABEL}>Token</label>
                <TokenSelector
                  value={token.address}
                  onChange={t => setToken(t as SupportedToken)}
                />
              </div>

              {/* Amount */}
              <div>
                <label className={LABEL}>
                  Amount
                  {tokenBalance !== undefined && (
                    <span className="ml-2 normal-case text-white/20">
                      bal: {(Number(tokenBalance) / 1e6).toFixed(2)} {token.symbol}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="10.00"
                    className={cn(INPUT, 'pr-20')}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest text-white/25">
                    {token.symbol}
                  </span>
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className={LABEL}>Birthday Date</label>
                <DatePicker
                  selected={birthday}
                  onChange={d => setBirthday(d)}
                  minDate={MIN_DATE}
                  placeholderText="Pick a date…"
                  className={INPUT}
                  wrapperClassName="w-full"
                  dateFormat="MMMM d, yyyy"
                  calendarClassName="birthday-drop-calendar"
                />
              </div>

              {/* Message */}
              <div>
                <label className={LABEL}>
                  Message
                  <span className="ml-2 normal-case text-white/20">{message.length}/200</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 200))}
                  placeholder="Happy Birthday! Wishing you all the best…"
                  rows={3}
                  className={cn(INPUT, 'resize-none leading-relaxed')}
                />
              </div>

              {/* Theme */}
              <div>
                <label className={LABEL}>Card Theme</label>
                <ThemeSelector
                  value={themeId}
                  onChange={(t: Theme) => setThemeId(t.id)}
                />
              </div>

              {/* Recurring */}
              <div
                onClick={() => setRecurring(!recurring)}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 border cursor-pointer transition-colors select-none',
                  recurring
                    ? 'border-[#FFE234]/30 bg-[#FFE234]/5'
                    : 'border-white/10 hover:border-white/20',
                )}
              >
                <div className={cn(
                  'w-4 h-4 border flex items-center justify-center shrink-0 transition-colors',
                  recurring ? 'border-[#FFE234] bg-[#FFE234]' : 'border-white/20',
                )}>
                  {recurring && <span className="text-black text-[10px] font-black leading-none">✓</span>}
                </div>
                <div>
                  <p className="text-sm font-mono text-white flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 text-[#FFE234]" />
                    Annual Recurring Gift
                  </p>
                  <p className="text-[10px] font-mono text-white/30 mt-0.5">
                    You will be notified to renew each year.
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 border-l-2 border-white/10 pl-4">
                <Lock className="w-3 h-3 text-white/20 mt-0.5 shrink-0" />
                <p className="text-[11px] font-mono text-white/30 leading-relaxed">
                  Funds are locked in the vault contract. Only the recipient can claim — and only after
                  their birthday timestamp passes.
                </p>
              </div>

              {/* Action */}
              <div>
                {!isConnected ? (
                  <div className="border border-white/10 inline-block">
                    <ConnectButton />
                  </div>
                ) : needsApprove ? (
                  <button
                    onClick={handleApprove}
                    disabled={isLoading || amountBig === 0n}
                    className="w-full py-4 bg-white text-black text-[11px] font-mono uppercase tracking-widest font-black hover:bg-white/90 transition-colors disabled:opacity-30"
                  >
                    {isLoading ? 'Approving…' : `01 — Approve ${token.symbol} Spend`}
                  </button>
                ) : (
                  <button
                    onClick={handleCreate}
                    disabled={!isValid || isLoading}
                    className={cn(
                      'w-full flex items-center justify-center gap-3 py-4 text-[11px] font-mono uppercase tracking-widest font-black transition-colors',
                      isValid && !isLoading
                        ? 'bg-[#FFE234] text-black hover:bg-[#FFE234]/90'
                        : 'bg-white/5 text-white/20 cursor-not-allowed',
                    )}
                  >
                    {isLoading ? 'Creating Gift…' : (
                      <>02 — Create Gift <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* ─── Live Preview ─────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col gap-4 sticky top-24">
              <p className={LABEL}>Live Card Preview</p>
              <GiftCardPreview
                sender={address ?? ''}
                recipient={recipient}
                amount={amount}
                symbol={token.symbol}
                message={message}
                birthday={birthday}
                themeId={themeId}
              />
              <div className="border border-white/[0.07] p-4">
                <p className="text-[10px] font-mono text-white/25 leading-relaxed">
                  This card is minted as an ERC-721 NFT on Arc. The SVG is generated fully
                  on-chain — no IPFS, no off-chain dependencies.
                </p>
              </div>
              {/* Theme preview strip */}
              <div className="flex h-1">
                {THEMES.map(t => (
                  <div
                    key={t.id}
                    className="flex-1"
                    style={{ background: t.id === themeId ? t.from : 'rgba(255,255,255,0.05)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
