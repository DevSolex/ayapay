'use client'

import { Wallet, LogOut, Loader2 } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import { useChainStore } from '@/store/chain'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/lib/utils'
import { shortenStacksAddress } from '@/lib/stacks'

/**
 * Chain-aware wallet button.
 * Shows Celo wallet when on Celo, Stacks wallet when on Stacks.
 */
export function WalletButton() {
  const {
    address, network, isConnecting, connectWallet, disconnect,
    stacksAddress, stacksNetwork, isConnectingStacks, connectStacksWallet, disconnectStacks,
  } = useWalletStore()
  const { activeChain } = useChainStore()

  // --- Stacks chain ---
  if (activeChain === 'STACKS') {
    if (stacksAddress) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="font-mono">{shortenStacksAddress(stacksAddress)}</span>
            {stacksNetwork && <span className="text-xs opacity-70">({stacksNetwork})</span>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={disconnectStacks}>
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={connectStacksWallet}
        disabled={isConnectingStacks}
        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
      >
        {isConnectingStacks ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
        {isConnectingStacks ? 'Connecting...' : 'Connect Stacks'}
      </Button>
    )
  }

  // --- Celo chain (default) ---
  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="font-mono">{shortenAddress(address)}</span>
          {network && <span className="text-xs opacity-70">({network})</span>}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={disconnect}>
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={connectWallet} disabled={isConnecting}>
      {isConnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}
