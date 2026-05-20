export const BIRTHDAY_DROP_ABI = [
  // Write
  {
    name: 'createGift',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient',         type: 'address' },
      { name: 'token',             type: 'address' },
      { name: 'amount',            type: 'uint256' },
      { name: 'birthdayTimestamp', type: 'uint256' },
      { name: 'message',           type: 'string'  },
      { name: 'theme',             type: 'uint8'   },
      { name: 'recurring',         type: 'bool'    },
    ],
    outputs: [{ name: 'giftId', type: 'uint256' }],
  },
  {
    name: 'claimGift',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'giftId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'cancelGift',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'giftId', type: 'uint256' }],
    outputs: [],
  },
  // Read
  {
    name: 'getGift',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'giftId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id',                type: 'uint256' },
          { name: 'sender',            type: 'address' },
          { name: 'recipient',         type: 'address' },
          { name: 'token',             type: 'address' },
          { name: 'amount',            type: 'uint256' },
          { name: 'birthdayTimestamp', type: 'uint256' },
          { name: 'message',           type: 'string'  },
          { name: 'theme',             type: 'uint8'   },
          { name: 'recurring',         type: 'bool'    },
          { name: 'cardTokenId',       type: 'uint256' },
          { name: 'claimed',           type: 'bool'    },
          { name: 'cancelled',         type: 'bool'    },
          { name: 'createdAt',         type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getGiftsByRecipient',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'recipient', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'id',                type: 'uint256' },
          { name: 'sender',            type: 'address' },
          { name: 'recipient',         type: 'address' },
          { name: 'token',             type: 'address' },
          { name: 'amount',            type: 'uint256' },
          { name: 'birthdayTimestamp', type: 'uint256' },
          { name: 'message',           type: 'string'  },
          { name: 'theme',             type: 'uint8'   },
          { name: 'recurring',         type: 'bool'    },
          { name: 'cardTokenId',       type: 'uint256' },
          { name: 'claimed',           type: 'bool'    },
          { name: 'cancelled',         type: 'bool'    },
          { name: 'createdAt',         type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getGiftsBySender',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'sender', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'id',                type: 'uint256' },
          { name: 'sender',            type: 'address' },
          { name: 'recipient',         type: 'address' },
          { name: 'token',             type: 'address' },
          { name: 'amount',            type: 'uint256' },
          { name: 'birthdayTimestamp', type: 'uint256' },
          { name: 'message',           type: 'string'  },
          { name: 'theme',             type: 'uint8'   },
          { name: 'recurring',         type: 'bool'    },
          { name: 'cardTokenId',       type: 'uint256' },
          { name: 'claimed',           type: 'bool'    },
          { name: 'cancelled',         type: 'bool'    },
          { name: 'createdAt',         type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getTotalGifts',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Events
  {
    name: 'GiftCreated',
    type: 'event',
    inputs: [
      { name: 'giftId',            type: 'uint256', indexed: true  },
      { name: 'sender',            type: 'address', indexed: true  },
      { name: 'recipient',         type: 'address', indexed: true  },
      { name: 'token',             type: 'address', indexed: false },
      { name: 'amount',            type: 'uint256', indexed: false },
      { name: 'birthdayTimestamp', type: 'uint256', indexed: false },
      { name: 'recurring',         type: 'bool',    indexed: false },
      { name: 'cardTokenId',       type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'GiftClaimed',
    type: 'event',
    inputs: [
      { name: 'giftId',    type: 'uint256', indexed: true  },
      { name: 'recipient', type: 'address', indexed: true  },
      { name: 'token',     type: 'address', indexed: false },
      { name: 'amount',    type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'GiftCancelled',
    type: 'event',
    inputs: [
      { name: 'giftId',  type: 'uint256', indexed: true },
      { name: 'sender',  type: 'address', indexed: true },
    ],
  },
  {
    name: 'RecurringGiftNeeded',
    type: 'event',
    inputs: [
      { name: 'originalGiftId', type: 'uint256', indexed: true  },
      { name: 'sender',         type: 'address', indexed: true  },
      { name: 'recipient',      type: 'address', indexed: true  },
      { name: 'nextBirthday',   type: 'uint256', indexed: false },
    ],
  },
] as const

export const BIRTHDAY_CARD_ABI = [
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs:  [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '',        type: 'string'  }],
  },
] as const

export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount',  type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner',   type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const
