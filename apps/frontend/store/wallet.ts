import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WalletType = 'celo' | 'stacks'

interface WalletState {
  address: string | null
  network: string | null
  chainId: number | null
  walletType: WalletType | null
  isConnecting: boolean
  connectCeloWallet: () => Promise<void>
  connectStacksWallet: () => Promise<void>
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
    StacksProvider?: {
      getAccounts: () => Promise<{ mainnet: string; testnet: string }[]>
      request: (method: string, params?: unknown) => Promise<unknown>
    }
    HiroWalletProvider?: {
      connect: () => Promise<{ address: string; network: string }>
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
      walletType: null,
      isConnecting: false,

      connectCeloWallet: async () => {
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
            set({ address, chainId: newChainId, network: getNetworkName(newChainId), walletType: 'celo' })
          } else {
            set({ address, chainId, network: getNetworkName(chainId), walletType: 'celo' })
          }
        } finally {
          set({ isConnecting: false })
        }
      },

      connectStacksWallet: async () => {
        if (typeof window === 'undefined') {
          throw new Error('Window not available')
        }

        set({ isConnecting: true })
        try {
          // Try Hiro Wallet first
          if (window.HiroWalletProvider) {
            const result = await window.HiroWalletProvider.connect()
            set({
              address: result.address,
              network: result.network,
              chainId: null,
              walletType: 'stacks',
            })
            return
          }

          // Try Xverse/Leather via StacksProvider
          if (window.StacksProvider) {
            const accounts = await window.StacksProvider.getAccounts()
            if (accounts && accounts.length > 0) {
              const address = accounts[0].testnet || accounts[0].mainnet
              set({
                address,
                network: 'Stacks Testnet',
                chainId: null,
                walletType: 'stacks',
              })
              return
            }
          }

          // Fallback: try to connect via userSession (for Hiro Wallet)
          const { AppConfig, UserSession, showConnect } = await import('@stacks/connect')
          const appConfig = new AppConfig(['store_write', 'publish_data'])
          const userSession = new UserSession({ appConfig })

          if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData()
            const address = userData.profile.stxAddress.testnet
            set({
              address,
              network: 'Stacks Testnet',
              chainId: null,
              walletType: 'stacks',
            })
          } else {
            showConnect({
              appDetails: {
                name: 'AyaPay',
                icon: window.location.origin + '/logo.png',
              },
              onFinish: () => {
                const userData = userSession.loadUserData()
                const address = userData.profile.stxAddress.testnet
                set({
                  address,
                  network: 'Stacks Testnet',
                  chainId: null,
                  walletType: 'stacks',
                })
              },
              userSession,
            })
          }
        } catch (error) {
          console.error('Stacks wallet connection error:', error)
          throw new Error(
            'No Stacks wallet detected. Please install Hiro Wallet or Xverse.'
          )
        } finally {
          set({ isConnecting: false })
        }
      },

      disconnect: () => set({ address: null, network: null, chainId: null, walletType: null }),
    }),
    {
      name: 'ayapay-wallet',
      partialize: (s) => ({ address: s.address, network: s.network, chainId: s.chainId, walletType: s.walletType }),
    }
  )
)
