/**
 * Application-wide constants for AyaPay backend.
 */

export const CELO_CHAIN_IDS = {
  MAINNET: 42220,
  ALFAJORES: 44787,
} as const

export const CELO_RPC_URLS = {
  MAINNET: 'https://forno.celo.org',
  ALFAJORES: 'https://alfajores-forno.celo-testnet.org',
} as const

export const CELOSCAN_URLS = {
  MAINNET: 'https://celoscan.io',
  ALFAJORES: 'https://alfajores.celoscan.io',
} as const

export const TOKEN_DECIMALS: Record<string, number> = {
  CELO: 18,
  cUSD: 18,
  USDC: 6,
  USDT: 6,
}

export const MAX_RETRY_COUNT = 3

export const PAYROLL_CRON_SCHEDULE = '0 9 1 * *'   // 1st of month, 9am UTC
export const RETRY_CRON_SCHEDULE   = '0 */6 * * *'  // every 6 hours

export const JWT_ALGORITHM = 'HS256'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100
