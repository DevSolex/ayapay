import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  address: string | null
  network: string | null
  chainId: number | null
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnect: () => void
}

// EIP-1193 provider (MetaMask, MiniPay, WalletConnect, etc.)
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
      isMetaMask?: boolean
      isMiniPay?: boolean
    }
  }
}

const CELO_CHAIN_ID = 42220       // Celo mainnet
const ALFAJORES_CHAIN_ID = 44787  // Celo Alfajores testnet

function getNetworkName(chainId: number): string {
  if (chainId === CELO_CHAIN_ID) return 'Celo'
  if (chainId === ALFAJORES_CHAIN_ID) return 'Alfajores'
  return `Chain ${chainId}`
}

// Add Celo network to MetaMask if not present
async function addCeloNetwork(testnet = true) {
  if (!window.ethereum) return
  const params = testnet
    ? {
        chainId: '0xAEF3', // 44787
        chainName: 'Celo Alfajores Testnet',
        nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
        rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
        blockExplorerUrls: ['https://alfajores.celoscan.io'],
      }
    : {
        chainId: '0xA4EC', // 42220
        chainName: 'Celo',
        nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
        rpcUrls: ['https://forno.celo.org'],
        blockExplorerUrls: ['https://celoscan.io'],
      }

  await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [params] })
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      network: null,
      chainId: null,
      isConnecting: false,

      connectWallet: async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error(
            'No Web3 wallet detected. Please install MetaMask or use the Celo MiniPay browser.'
          )
        }
        set({ isConnecting: true })
        try {
          // Request account access
          const accounts = (await window.ethereum.request({
            method: 'eth_requestAccounts',
          })) as string[]

          if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found. Please unlock your wallet.')
          }

          const address = accounts[0]

          // Get current chain
          const chainIdHex = (await window.ethereum.request({ method: 'eth_chainId' })) as string
          const chainId = parseInt(chainIdHex, 16)

          // If not on Celo, prompt to switch / add
          if (chainId !== CELO_CHAIN_ID && chainId !== ALFAJORES_CHAIN_ID) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xAEF3' }], // Switch to Alfajores
              })
            } catch (switchErr: unknown) {
              // Chain not added yet — add it
              const err = switchErr as { code?: number }
              if (err?.code === 4902) {
                await addCeloNetwork(true)
              } else {
                throw switchErr
              }
            }
            // Re-read chainId after switch
            const newChainIdHex = (await window.ethereum.request({ method: 'eth_chainId' })) as string
            const newChainId = parseInt(newChainIdHex, 16)
            set({ address, chainId: newChainId, network: getNetworkName(newChainId) })
          } else {
            set({ address, chainId, network: getNetworkName(chainId) })
          }
        } finally {
          set({ isConnecting: false })
        }
      },

      disconnect: () => set({ address: null, network: null, chainId: null }),
    }),
    {
      name: 'ayapay-wallet',
      partialize: (s) => ({ address: s.address, network: s.network, chainId: s.chainId }),
    }
  )
)
