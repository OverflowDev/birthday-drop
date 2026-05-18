export const BIRTHDAY_DROP_ADDRESS =
  (process.env.NEXT_PUBLIC_BIRTHDAY_DROP_ADDRESS as `0x${string}`) ?? '0x0000000000000000000000000000000000000000'

export const BIRTHDAY_CARD_ADDRESS =
  (process.env.NEXT_PUBLIC_BIRTHDAY_CARD_ADDRESS as `0x${string}`) ?? '0x0000000000000000000000000000000000000000'

// Arc Testnet stablecoins
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as `0x${string}`
export const EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' as `0x${string}`

export const SUPPORTED_TOKENS = [
  { address: USDC_ADDRESS, symbol: 'USDC', name: 'USD Coin',  decimals: 6, flag: '🇺🇸' },
  { address: EURC_ADDRESS, symbol: 'EURC', name: 'Euro Coin', decimals: 6, flag: '🇪🇺' },
] as const

export type SupportedToken = (typeof SUPPORTED_TOKENS)[number]

export const THEMES = [
  { id: 0, name: 'Birthday', emoji: '🎂', from: '#FF6B6B', to: '#FFE66D', preview: 'from-red-400 to-yellow-300' },
  { id: 1, name: 'Ocean',    emoji: '🌊', from: '#0099F7', to: '#F11712', preview: 'from-blue-500 to-red-500' },
  { id: 2, name: 'Sunset',   emoji: '🌅', from: '#F7971E', to: '#FFD200', preview: 'from-orange-400 to-yellow-400' },
  { id: 3, name: 'Midnight', emoji: '🌙', from: '#141E30', to: '#243B55', preview: 'from-slate-900 to-blue-900' },
  { id: 4, name: 'Garden',   emoji: '🌸', from: '#56AB2F', to: '#A8E063', preview: 'from-green-600 to-lime-400' },
] as const

export type Theme = (typeof THEMES)[number]

export const EXPLORER_URL = 'https://testnet.arcscan.app'
export const FAUCET_URL   = 'https://faucet.circle.com'
