/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BIRTHDAY_DROP_ADDRESS: process.env.NEXT_PUBLIC_BIRTHDAY_DROP_ADDRESS,
    NEXT_PUBLIC_BIRTHDAY_CARD_ADDRESS: process.env.NEXT_PUBLIC_BIRTHDAY_CARD_ADDRESS,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
}

module.exports = nextConfig
