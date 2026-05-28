import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SupportedChain } from '@/types'

interface ChainState {
  /** The currently active chain */
  activeChain: SupportedChain
  /** Switch the active chain */
  setChain: (chain: SupportedChain) => void
}

/**
 * Global chain switcher store.
 * Controls which blockchain the dashboard UI is targeting.
 * Persisted to localStorage so users return to their last chain.
 */
export const useChainStore = create<ChainState>()(
  persist(
    (set) => ({
      activeChain: 'CELO',
      setChain: (chain) => set({ activeChain: chain }),
    }),
    {
      name: 'ayapay-chain',
      partialize: (s) => ({ activeChain: s.activeChain }),
    }
  )
)
