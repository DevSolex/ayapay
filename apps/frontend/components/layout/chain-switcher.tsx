'use client'

import { useChainStore } from '@/store/chain'
import type { SupportedChain } from '@/types'

const CHAINS: { id: SupportedChain; label: string; color: string; bgColor: string }[] = [
  { id: 'CELO', label: 'Celo', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/30' },
  { id: 'STACKS', label: 'Stacks', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30' },
]

/**
 * Chain switcher component for the topbar.
 * Allows users to toggle between Celo and Stacks chains.
 */
export function ChainSwitcher() {
  const { activeChain, setChain } = useChainStore()

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border" id="chain-switcher">
      {CHAINS.map(({ id, label, color, bgColor }) => {
        const isActive = activeChain === id
        return (
          <button
            key={id}
            onClick={() => setChain(id)}
            className={`
              relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
              transition-all duration-200 ease-out
              ${isActive
                ? `${bgColor} ${color} border shadow-sm`
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }
            `}
            aria-label={`Switch to ${label}`}
            id={`chain-switch-${id.toLowerCase()}`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                isActive ? 'bg-current animate-pulse' : 'bg-muted-foreground/40'
              }`}
            />
            {label}
            {isActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current opacity-60 animate-ping" />
            )}
          </button>
        )
      })}
    </div>
  )
}
