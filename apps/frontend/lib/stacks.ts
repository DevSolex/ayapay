/**
 * Stacks network helpers for the AyaPay frontend.
 * Mirrors the structure of lib/celo.ts for consistency.
 */

/** Stacks Mainnet chain ID */
export const STACKS_MAINNET_CHAIN_ID = 1

/** Stacks Testnet chain ID */
export const STACKS_TESTNET_CHAIN_ID = 2147483648

/** Contract deployer address on mainnet */
export const STACKS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS || ''

/** Contract name */
export const STACKS_CONTRACT_NAME = 'ayapay'

/** Stacks network configuration */
export const STACKS_NETWORKS = {
  mainnet: {
    name: 'Stacks Mainnet',
    url: 'https://api.mainnet.hiro.so',
    explorer: 'https://explorer.hiro.so',
  },
  testnet: {
    name: 'Stacks Testnet',
    url: 'https://api.testnet.hiro.so',
    explorer: 'https://explorer.hiro.so/?chain=testnet',
  },
} as const

export type StacksNetworkType = keyof typeof STACKS_NETWORKS

/** Currently active network — defaults to mainnet */
export const ACTIVE_STACKS_NETWORK: StacksNetworkType =
  (process.env.NEXT_PUBLIC_STACKS_NETWORK as StacksNetworkType) || 'mainnet'

/** Get the active API URL */
export function getStacksApiUrl(): string {
  return STACKS_NETWORKS[ACTIVE_STACKS_NETWORK].url
}

/** Return the Stacks Explorer URL for a transaction ID. */
export function stacksTxUrl(txId: string): string {
  const net = STACKS_NETWORKS[ACTIVE_STACKS_NETWORK]
  const chainParam = ACTIVE_STACKS_NETWORK === 'testnet' ? '&chain=testnet' : ''
  return `${net.explorer}/txid/${txId}?${chainParam}`
}

/** Return the Stacks Explorer URL for an address. */
export function stacksAddressUrl(address: string): string {
  const net = STACKS_NETWORKS[ACTIVE_STACKS_NETWORK]
  const chainParam = ACTIVE_STACKS_NETWORK === 'testnet' ? '&chain=testnet' : ''
  return `${net.explorer}/address/${address}?${chainParam}`
}

/** Return the Stacks network name for display. */
export function stacksNetworkName(): string {
  return STACKS_NETWORKS[ACTIVE_STACKS_NETWORK].name
}

/** Check if a string looks like a valid Stacks address (SP or ST prefix). */
export function isStacksAddress(address: string): boolean {
  return /^(SP|ST|SN)[A-Z0-9]{38,}$/i.test(address)
}

/** Format a Stacks address for display. */
export function shortenStacksAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 4) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/** Convert microSTX to STX. */
export function microStxToStx(microStx: number | string): number {
  return Number(microStx) / 1_000_000
}

/** Convert STX to microSTX. */
export function stxToMicroStx(stx: number | string): number {
  return Math.round(Number(stx) * 1_000_000)
}
