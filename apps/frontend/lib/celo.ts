/**
 * Celo network helpers for the AyaPay frontend.
 */

export const CELO_CHAIN_ID   = 42220
export const ALFAJORES_CHAIN_ID = 44787

export const CELO_NETWORKS = {
  [CELO_CHAIN_ID]:    { name: 'Celo',      explorer: 'https://celoscan.io' },
  [ALFAJORES_CHAIN_ID]: { name: 'Alfajores', explorer: 'https://alfajores.celoscan.io' },
} as const

/** Return the Celoscan URL for a transaction hash. */
export function txUrl(txHash: string, chainId = ALFAJORES_CHAIN_ID): string {
  const net = CELO_NETWORKS[chainId as keyof typeof CELO_NETWORKS]
  const base = net?.explorer ?? 'https://alfajores.celoscan.io'
  return `${base}/tx/${txHash}`
}

/** Return the Celoscan URL for an address. */
export function addressUrl(address: string, chainId = ALFAJORES_CHAIN_ID): string {
  const net = CELO_NETWORKS[chainId as keyof typeof CELO_NETWORKS]
  const base = net?.explorer ?? 'https://alfajores.celoscan.io'
  return `${base}/address/${address}`
}

/** Return a human-readable network name from chain ID. */
export function networkName(chainId: number): string {
  return CELO_NETWORKS[chainId as keyof typeof CELO_NETWORKS]?.name ?? `Chain ${chainId}`
}

/** Check if a string looks like a valid EVM address. */
export function isEvmAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}
