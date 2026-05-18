'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useWalletStore } from '@/store/wallet'

interface CeloBalances {
  CELO?: string
  USDC?: string
  USDT?: string
  cUSD?: string
  [key: string]: string | undefined
}

/**
 * Hook to fetch the connected wallet's Celo token balances from the backend.
 * Automatically re-fetches every 30 seconds when a wallet is connected.
 */
export function useCeloBalance() {
  const { address } = useWalletStore()

  return useQuery<CeloBalances>({
    queryKey: ['celo-balance', address],
    queryFn: async () => {
      if (!address) return {}
      const res = await api.get(`/wallets/balance/${address}`)
      return res.data.data as CeloBalances
    },
    enabled: !!address,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}
