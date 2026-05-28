import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  // Celo wallet
  address: string | null
  network: string | null
  chainId: number | null
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnect: () => void

  // Stacks wallet
  stacksAddress: string | null
  stacksNetwork: string | null
  isConnectingStacks: boolean
  connectStacksWallet: () => Promise<void>
  disconnectStacks: () => void
  setStacksAddress: (address: string | null) => void
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
    StacksProvider?: {
      request: (method: string, params?: unknown) => Promise<unknown>
    }
    LeatherProvider?: {
      request: (method: string, params?: unknown) => Promise<unknown>
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
      // Celo state
      address: null,
      network: null,
      chainId: null,
      isConnecting: false,

      // Stacks state
      stacksAddress: null,
      stacksNetwork: null,
      isConnectingStacks: false,

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

      connectStacksWallet: async () => {
        set({ isConnectingStacks: true })
        try {
          // Try Leather/Hiro wallet
          const provider = window.StacksProvider || window.LeatherProvider
          if (provider) {
            const response = await provider.request('getAddresses') as {
              result: { addresses: Array<{ address: string; type: string }> }
            }
            const mainnetAddr = response.result.addresses.find(
              (a: { type: string }) => a.type === 'stacks'
            )
            if (mainnetAddr) {
              set({
                stacksAddress: mainnetAddr.address,
                stacksNetwork: 'Stacks Mainnet',
              })
              return
            }
          }
          throw new Error(
            'No Stacks wallet detected. Please install the Leather (Hiro) wallet extension.'
          )
        } finally {
          set({ isConnectingStacks: false })
        }
      },

      disconnectStacks: () => set({ stacksAddress: null, stacksNetwork: null }),

      setStacksAddress: (address) => set({
        stacksAddress: address,
        stacksNetwork: address ? 'Stacks Mainnet' : null,
      }),
    }),
    {
      name: 'ayapay-wallet',
      partialize: (s) => ({
        address: s.address,
        network: s.network,
        chainId: s.chainId,
        stacksAddress: s.stacksAddress,
        stacksNetwork: s.stacksNetwork,
      }),
    }
  )
)
