/**
 * Formatting utilities for AyaPay backend responses.
 */

/**
 * Format a Celo/EVM address to shortened form: 0x1234...abcd
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format a token amount with symbol for display.
 * e.g. formatTokenAmount('1500.50', 'USDC') => '1,500.50 USDC'
 */
export function formatTokenAmount(amount: string | number, token: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return `0 ${token}`
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${token}`
}

/**
 * Convert a Celo transaction hash to a Celoscan explorer URL.
 */
export function celoscanTxUrl(txHash: string, network: 'alfajores' | 'mainnet' = 'alfajores'): string {
  const base = network === 'mainnet' ? 'https://celoscan.io' : 'https://alfajores.celoscan.io'
  return `${base}/tx/${txHash}`
}

/**
 * Convert a Celo address to a Celoscan explorer URL.
 */
export function celoscanAddressUrl(address: string, network: 'alfajores' | 'mainnet' = 'alfajores'): string {
  const base = network === 'mainnet' ? 'https://celoscan.io' : 'https://alfajores.celoscan.io'
  return `${base}/address/${address}`
}
