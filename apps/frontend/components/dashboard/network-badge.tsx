'use client'

import { useWalletStore } from '@/store/wallet'
import { useChainStore } from '@/store/chain'

/**
 * Shows the connected network name in the dashboard.
 * Supports both Celo and Stacks networks.
 */
export function NetworkBadge() {
  const { network, address, stacksAddress, stacksNetwork } = useWalletStore()
  const { activeChain } = useChainStore()

  const isStacks = activeChain === 'STACKS'
  const currentAddress = isStacks ? stacksAddress : address
  const currentNetwork = isStacks ? stacksNetwork : network

  if (!currentAddress || !currentNetwork) return null

  const isTestnet = isStacks
    ? currentNetwork.toLowerCase().includes('testnet')
    : currentNetwork.toLowerCase().includes('alfajores')

  const colors = isStacks
    ? isTestnet
      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
    : isTestnet
      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      : 'bg-green-500/10 border-green-500/30 text-green-400'

  const dotColor = isStacks
    ? isTestnet ? 'bg-yellow-400' : 'bg-orange-400'
    : isTestnet ? 'bg-yellow-400' : 'bg-green-400'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${colors}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {currentNetwork}
    </span>
  )
}
