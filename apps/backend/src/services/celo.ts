import { JsonRpcProvider, Wallet, Contract, isAddress, parseUnits, formatUnits } from 'ethers'
import { config } from '../utils/config'

// ── Network setup ────────────────────────────────────────────────────────────

export const provider = new JsonRpcProvider(config.celo.rpcUrl)

export const adminWallet = config.celo.adminPrivateKey
  ? new Wallet(config.celo.adminPrivateKey, provider)
  : null

// ── Token contract addresses ─────────────────────────────────────────────────

const TESTNET_TOKENS: Record<string, string> = {
  USDC: '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B', // USDC on Alfajores
  USDT: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // placeholder — update when available
  cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1', // cUSD on Alfajores
  CELO: 'native',
}

const MAINNET_TOKENS: Record<string, string> = {
  USDC: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', // USDC on Celo mainnet
  USDT: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e', // USDT on Celo mainnet
  cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // cUSD on mainnet
  CELO: 'native',
}

export const TOKEN_CONTRACTS =
  config.celo.network === 'alfajores' ? TESTNET_TOKENS : MAINNET_TOKENS

// ── Minimal ERC-20 ABI ───────────────────────────────────────────────────────

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

// ── Balance fetching ─────────────────────────────────────────────────────────

export async function getAccountBalance(address: string): Promise<Record<string, string>> {
  if (!isAddress(address)) return {}

  try {
    const balances: Record<string, string> = {}

    // Native CELO balance
    const nativeBalance = await provider.getBalance(address)
    balances['CELO'] = formatUnits(nativeBalance, 18)

    // ERC-20 token balances
    for (const [symbol, contractAddress] of Object.entries(TOKEN_CONTRACTS)) {
      if (contractAddress === 'native') continue
      try {
        const contract = new Contract(contractAddress, ERC20_ABI, provider)
        const [balance, decimals] = await Promise.all([
          contract.balanceOf(address) as Promise<bigint>,
          contract.decimals() as Promise<number>,
        ])
        balances[symbol] = formatUnits(balance, decimals)
      } catch {
        // Token may not exist on this network — skip
      }
    }

    return balances
  } catch {
    return {}
  }
}

// ── Address validation ───────────────────────────────────────────────────────

export function isValidCeloAddress(address: string): boolean {
  return isAddress(address)
}

// ── Token transfer helper ────────────────────────────────────────────────────

export async function transferToken(
  recipientAddress: string,
  amount: string,
  token: string
): Promise<string> {
  if (!adminWallet) throw new Error('Admin wallet not configured')

  if (token === 'CELO') {
    const tx = await adminWallet.sendTransaction({
      to: recipientAddress,
      value: parseUnits(amount, 18),
    })
    const receipt = await tx.wait()
    if (!receipt || receipt.status === 0) throw new Error('Transaction reverted on-chain')
    return receipt.hash
  }

  const contractAddress = TOKEN_CONTRACTS[token]
  if (!contractAddress || contractAddress === 'native') {
    throw new Error(`Unsupported token: ${token}`)
  }

  const contract = new Contract(contractAddress, ERC20_ABI, adminWallet)
  const decimals = (await contract.decimals()) as number
  const amountInUnits = parseUnits(amount, decimals)

  const tx = await (contract.transfer(recipientAddress, amountInUnits) as Promise<{ wait: () => Promise<{ hash: string; status: number } | null> }>)
  const receipt = await tx.wait()
  if (!receipt || receipt.status === 0) throw new Error('Transaction reverted on-chain')
  return receipt.hash
}
