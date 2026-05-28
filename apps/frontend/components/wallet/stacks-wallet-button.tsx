'use client'

import { Wallet, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shortenStacksAddress } from '@/lib/stacks'

interface StacksWalletState {
  address: string | null
  isConnecting: boolean
}

/**
 * Stacks wallet connect/disconnect button.
 * Uses the Leather/Hiro browser wallet via a simple postMessage flow.
 * Falls back to manual address entry if no wallet extension is detected.
 */
export function StacksWalletButton({
  address,
  isConnecting,
  onConnect,
  onDisconnect,
}: {
  address: string | null
  isConnecting: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="font-mono">{shortenStacksAddress(address)}</span>
          <span className="text-xs opacity-70">(Stacks)</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDisconnect}>
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onConnect}
      disabled={isConnecting}
      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4 mr-2" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect Stacks'}
    </Button>
  )
}
