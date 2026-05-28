'use client'

import { useQuery } from '@tanstack/react-query'
import { getStxBalance } from '@/lib/stacks-contract'
import { microStxToStx } from '@/lib/stacks'

interface StacksBalances {
  STX: string
  locked: string
}

/**
 * Hook to fetch the connected Stacks wallet's STX balance.
 * Automatically re-fetches every 30 seconds when an address is available.
 */
export function useStacksBalance(address: string | null) {
  return useQuery<StacksBalances>({
    queryKey: ['stacks-balance', address],
    queryFn: async () => {
      if (!address) return { STX: '0', locked: '0' }
      const data = await getStxBalance(address)
      return {
        STX: microStxToStx(data.stx).toFixed(6),
        locked: microStxToStx(data.stxLocked).toFixed(6),
      }
    },
    enabled: !!address,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}
