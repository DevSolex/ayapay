'use client'

import { useWalletStore } from '@/store/wallet'

/**
 * Shows the connected Celo network name in the dashboard topbar.
 * Only renders when a wallet is connected.
 */
export function NetworkBadge() {
  const { network, address } = useWalletStore()

  if (!address || !network) return null

  const isTestnet = network.toLowerCase().includes('alfajores')

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
      isTestnet
        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        : 'bg-green-500/10 border-green-500/30 text-green-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isTestnet ? 'bg-yellow-400' : 'bg-green-400'}`} />
      {network}
    </span>
  )
}
