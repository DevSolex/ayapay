import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  contractPrincipalCV,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  createAssetInfo,
  makeStandardFungiblePostCondition,
  cvToJSON,
  callReadOnlyFunction,
} from '@stacks/transactions'
import { StacksTestnet, StacksMainnet } from '@stacks/network'
import { c32addressDecode } from 'c32check'
import { config } from '../utils/config'

// ── Network setup ────────────────────────────────────────────────────────────

export const network =
  config.stacks.network === 'mainnet' ? new StacksMainnet() : new StacksTestnet()

// ── Token contract addresses ─────────────────────────────────────────────────

const TESTNET_TOKENS: Record<string, { address: string; name: string }> = {
  STX: { address: 'native', name: 'STX' },
  USDA: {
    address: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    name: 'usda-token',
  },
  sBTC: {
    address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    name: 'sbtc-token',
  },
}

const MAINNET_TOKENS: Record<string, { address: string; name: string }> = {
  STX: { address: 'native', name: 'STX' },
  USDA: {
    address: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    name: 'usda-token',
  },
  sBTC: {
    address: 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR',
    name: 'sbtc-token',
  },
}

export const TOKEN_CONTRACTS =
  config.stacks.network === 'testnet' ? TESTNET_TOKENS : MAINNET_TOKENS

// ── Address validation ───────────────────────────────────────────────────────

export function isValidStacksAddress(address: string): boolean {
  try {
    const decoded = c32addressDecode(address)
    return decoded.length === 2 && decoded[1].length === 20
  } catch {
    return false
  }
}

// ── Balance fetching ─────────────────────────────────────────────────────────

export async function getAccountBalance(
  address: string
): Promise<Record<string, string>> {
  if (!isValidStacksAddress(address)) return {}

  try {
    const balances: Record<string, string> = {}

    // Fetch STX balance from API
    const response = await fetch(`${config.stacks.apiUrl}/extended/v1/address/${address}/balances`)
    if (!response.ok) return {}

    const data = await response.json()
    
    // Native STX balance (in microSTX, convert to STX)
    balances['STX'] = (parseInt(data.stx.balance) / 1_000_000).toString()

    // Fungible token balances
    if (data.fungible_tokens) {
      for (const [tokenId, tokenData] of Object.entries(data.fungible_tokens)) {
        const balance = (tokenData as { balance: string }).balance
        // Parse token identifier to get symbol
        const parts = tokenId.split('::')
        if (parts.length === 2) {
          const tokenName = parts[1]
          // Map to our known tokens
          for (const [symbol, info] of Object.entries(TOKEN_CONTRACTS)) {
            if (info.name === tokenName) {
              balances[symbol] = (parseInt(balance) / 1_000_000).toString()
              break
            }
          }
        }
      }
    }

    return balances
  } catch {
    return {}
  }
}

// ── Token transfer helper ────────────────────────────────────────────────────

export async function transferToken(
  recipientAddress: string,
  amount: string,
  token: string
): Promise<string> {
  if (!config.stacks.adminPrivateKey) {
    throw new Error('Stacks admin private key not configured')
  }

  const amountInMicroUnits = Math.floor(parseFloat(amount) * 1_000_000)

  if (token === 'STX') {
    // Native STX transfer
    const txOptions = {
      recipient: recipientAddress,
      amount: BigInt(amountInMicroUnits),
      senderKey: config.stacks.adminPrivateKey,
      network,
      anchorMode: AnchorMode.Any,
    }

    const transaction = await makeContractCall({
      ...txOptions,
      contractAddress: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      contractName: 'sip-010-trait-ft-standard',
      functionName: 'transfer',
      functionArgs: [
        uintCV(amountInMicroUnits),
        standardPrincipalCV(txOptions.recipient),
        standardPrincipalCV(recipientAddress),
      ],
      postConditionMode: PostConditionMode.Allow,
      anchorMode: AnchorMode.Any,
      senderKey: config.stacks.adminPrivateKey,
      network,
    })

    const broadcastResponse = await broadcastTransaction(transaction, network)
    if ('error' in broadcastResponse) {
      throw new Error(broadcastResponse.error)
    }
    return broadcastResponse.txid
  }

  // SIP-010 token transfer
  const tokenInfo = TOKEN_CONTRACTS[token]
  if (!tokenInfo || tokenInfo.address === 'native') {
    throw new Error(`Unsupported token: ${token}`)
  }

  const txOptions = {
    contractAddress: tokenInfo.address,
    contractName: tokenInfo.name,
    functionName: 'transfer',
    functionArgs: [
      uintCV(amountInMicroUnits),
      standardPrincipalCV(config.stacks.adminPrivateKey), // sender
      standardPrincipalCV(recipientAddress), // recipient
      standardPrincipalCV(recipientAddress), // memo (optional, using recipient as placeholder)
    ],
    senderKey: config.stacks.adminPrivateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  }

  const transaction = await makeContractCall(txOptions)
  const broadcastResponse = await broadcastTransaction(transaction, network)

  if ('error' in broadcastResponse) {
    throw new Error(broadcastResponse.error)
  }

  return broadcastResponse.txid
}

// ── Contract interaction helpers ─────────────────────────────────────────────

export async function addEmployee(
  employeeId: string,
  walletAddress: string,
  salary: number,
  token: string
): Promise<string> {
  if (!config.stacks.adminPrivateKey || !config.stacks.contractAddress) {
    throw new Error('Stacks contract not configured')
  }

  const tokenInfo = TOKEN_CONTRACTS[token]
  if (!tokenInfo) {
    throw new Error(`Unsupported token: ${token}`)
  }

  const salaryInMicroUnits = Math.floor(salary * 1_000_000)

  const txOptions = {
    contractAddress: config.stacks.contractAddress,
    contractName: config.stacks.contractName,
    functionName: 'add-employee',
    functionArgs: [
      standardPrincipalCV(employeeId),
      standardPrincipalCV(walletAddress),
      uintCV(salaryInMicroUnits),
      contractPrincipalCV(tokenInfo.address, tokenInfo.name),
    ],
    senderKey: config.stacks.adminPrivateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  }

  const transaction = await makeContractCall(txOptions)
  const broadcastResponse = await broadcastTransaction(transaction, network)

  if ('error' in broadcastResponse) {
    throw new Error(broadcastResponse.error)
  }

  return broadcastResponse.txid
}

export async function payEmployee(
  employeeId: string,
  amount: number,
  token: string
): Promise<string> {
  if (!config.stacks.adminPrivateKey || !config.stacks.contractAddress) {
    throw new Error('Stacks contract not configured')
  }

  const tokenInfo = TOKEN_CONTRACTS[token]
  if (!tokenInfo) {
    throw new Error(`Unsupported token: ${token}`)
  }

  const amountInMicroUnits = Math.floor(amount * 1_000_000)

  const txOptions = {
    contractAddress: config.stacks.contractAddress,
    contractName: config.stacks.contractName,
    functionName: 'pay-employee',
    functionArgs: [
      standardPrincipalCV(employeeId),
      uintCV(amountInMicroUnits),
      contractPrincipalCV(tokenInfo.address, tokenInfo.name),
    ],
    senderKey: config.stacks.adminPrivateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  }

  const transaction = await makeContractCall(txOptions)
  const broadcastResponse = await broadcastTransaction(transaction, network)

  if ('error' in broadcastResponse) {
    throw new Error(broadcastResponse.error)
  }

  return broadcastResponse.txid
}

export async function getEmployee(employeeId: string): Promise<unknown> {
  if (!config.stacks.contractAddress) {
    throw new Error('Stacks contract not configured')
  }

  const options = {
    contractAddress: config.stacks.contractAddress,
    contractName: config.stacks.contractName,
    functionName: 'get-employee',
    functionArgs: [standardPrincipalCV(employeeId)],
    network,
    senderAddress: config.stacks.contractAddress,
  }

  const result = await callReadOnlyFunction(options)
  return cvToJSON(result)
}
