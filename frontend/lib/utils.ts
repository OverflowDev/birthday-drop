import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortAddr(addr: string): string {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function formatTokenAmount(amount: bigint, decimals = 6): string {
  const divisor = BigInt(10 ** decimals)
  const whole = amount / divisor
  const frac  = amount % divisor
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, 2)
  return `${whole}.${fracStr}`
}

export function parseTokenAmount(value: string, decimals = 6): bigint {
  const [whole, frac = ''] = value.split('.')
  const fracPadded = frac.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole || '0') * BigInt(10 ** decimals) + BigInt(fracPadded || '0')
}

export function formatBirthday(ts: bigint): string {
  const d = new Date(Number(ts) * 1000)
  return format(d, 'MMM d, yyyy')
}

export function timeUntil(ts: bigint): string {
  const d = new Date(Number(ts) * 1000)
  if (d <= new Date()) return 'Ready to claim!'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function isBirthdayPassed(ts: bigint): boolean {
  return Date.now() >= Number(ts) * 1000
}

export function explorerTx(hash: string): string {
  return `https://testnet.arcscan.app/tx/${hash}`
}

export function explorerAddr(addr: string): string {
  return `https://testnet.arcscan.app/address/${addr}`
}
