# Birthday Drop

Time-locked stablecoin birthday gifts on Arc. Send USDC or EURC that unlock on someone's birthday — each gift mints a unique on-chain SVG NFT card to the recipient.

---

## How it works

1. **Create** — Connect wallet, pick a recipient, token, amount, birthday date and a message
2. **NFT minted** — An ERC-721 gift card with fully on-chain SVG art is sent to the recipient immediately
3. **Locked** — Funds sit in the vault contract until the birthday timestamp passes
4. **Claim** — Recipient claims on their birthday, tokens transfer in one tx, card marks as Claimed

---

## Features

- On-chain SVG NFT gift cards — no IPFS, no off-chain dependencies
- Multi-token: USDC and EURC
- 5 visual card themes (Birthday, Ocean, Sunset, Midnight, Garden)
- Annual recurring gifts with renewal notifications
- Cancel + refund before claim
- Sub-second finality on Arc (~0.48s)
- ~$0.01 gas per transaction (USDC-denominated)

---

## Stack

### Contracts
| | |
|---|---|
| Language | Solidity 0.8.24 |
| Framework | Foundry |
| Libraries | OpenZeppelin v5 |

### Frontend
| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Chain / Wallet | wagmi v2 + viem + RainbowKit v2 |
| Animations | Framer Motion |
| Styling | Tailwind CSS |

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- A [WalletConnect project ID](https://cloud.walletconnect.com)

---

### Contracts

**1. Install dependencies**
```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

**2. Configure environment**
```bash
cp .env.example .env
```
Fill in:
```
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

**3. Run tests**
```bash
forge test -v
```

**4. Deploy to Arc Testnet**
```bash
forge script script/Deploy.s.sol \
  --rpc-url arc_testnet \
  --broadcast \
  --verify
```
Copy the `BirthdayCard` and `BirthdayDrop` addresses from the output.

---

### Frontend

**1. Install dependencies**
```bash
cd frontend
npm install
```

**2. Configure environment**
```bash
cp .env.local.example .env.local
```
Fill in:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_BIRTHDAY_DROP_ADDRESS=0xYOUR_DROP_ADDRESS
NEXT_PUBLIC_BIRTHDAY_CARD_ADDRESS=0xYOUR_CARD_ADDRESS
```

**3. Run dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Arc Network Reference

| | |
|---|---|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| Faucet | `https://faucet.circle.com` |
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| Gas token | USDC (18 decimals native, 6 decimals ERC-20) |

---

## Contract Architecture

```
contracts/src/
├── BirthdayCard.sol   ERC-721 NFT with fully on-chain SVG. 5 themes.
│                      Minted to recipient on gift creation.
│                      Marked claimed/cancelled by BirthdayDrop.
│
└── BirthdayDrop.sol   Gift vault. Holds tokens until birthday.
                       createGift() — locks tokens, mints NFT
                       claimGift()  — transfers tokens after birthday
                       cancelGift() — refunds sender, cancels NFT
```

---

## Project Structure

```
birthday-drop/
├── contracts/
│   ├── src/
│   │   ├── BirthdayCard.sol
│   │   └── BirthdayDrop.sol
│   ├── test/
│   │   └── BirthdayDrop.t.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   └── foundry.toml
│
└── frontend/
    ├── app/
    │   ├── page.tsx          Landing page
    │   ├── create/page.tsx   Gift creation form + live NFT preview
    │   └── dashboard/page.tsx Sent / received gifts dashboard
    ├── components/
    │   ├── Header.tsx
    │   ├── LogoMark.tsx
    │   ├── GiftCardPreview.tsx
    │   ├── GiftItem.tsx
    │   ├── CountdownTimer.tsx
    │   ├── TokenSelector.tsx
    │   └── ThemeSelector.tsx
    └── lib/
        ├── wagmi.ts      Arc chain config + RainbowKit
        ├── contracts.ts  Addresses, token list, themes
        ├── abi.ts        Contract ABIs
        └── utils.ts      Formatting helpers
```

---

## License

MIT
