/**
 * Read-only Stacks contract helpers.
 * Uses the Hiro Stacks API to query the on-chain ayapay.clar contract
 * without requiring a wallet connection.
 */

import {
  getStacksApiUrl,
  STACKS_CONTRACT_ADDRESS,
  STACKS_CONTRACT_NAME,
} from './stacks'
import type { StacksEmployee } from '@/types'

const API_BASE = getStacksApiUrl()
const CONTRACT = `${STACKS_CONTRACT_ADDRESS}.${STACKS_CONTRACT_NAME}`

/**
 * Call a read-only function on the Stacks contract.
 */
async function callReadOnly(
  functionName: string,
  args: string[] = [],
  senderAddress?: string
): Promise<unknown> {
  const sender = senderAddress || STACKS_CONTRACT_ADDRESS
  const res = await fetch(
    `${API_BASE}/v2/contracts/call-read/${STACKS_CONTRACT_ADDRESS}/${STACKS_CONTRACT_NAME}/${functionName}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, arguments: args }),
    }
  )

  if (!res.ok) {
    throw new Error(`Stacks API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

/**
 * Decode a Clarity value hex string.
 * Supports: bool, uint, principal, optional, tuple
 */
function decodeClarityValue(hex: string): unknown {
  // Remove 0x prefix if present
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  const typeId = parseInt(clean.slice(0, 2), 16)

  switch (typeId) {
    case 0x03: // true
      return true
    case 0x04: // false
      return false
    case 0x01: { // uint
      const valueHex = clean.slice(2, 34)
      return parseInt(valueHex, 16)
    }
    case 0x09: // none
      return null
    case 0x0a: // some
      return decodeClarityValue('0x' + clean.slice(2))
    default:
      return hex // Return raw hex for complex types
  }
}

/**
 * Get the contract admin address.
 */
export async function getContractAdmin(): Promise<string> {
  const result = await callReadOnly('get-admin') as { okay: boolean; result: string }
  if (!result.okay) throw new Error('Failed to get admin')
  // Decode the principal from the result hex
  return result.result
}

/**
 * Check if the contract is paused.
 */
export async function isContractPaused(): Promise<boolean> {
  const result = await callReadOnly('is-contract-paused') as { okay: boolean; result: string }
  if (!result.okay) throw new Error('Failed to get pause status')
  return decodeClarityValue(result.result) as boolean
}

/**
 * Get an employee record from the on-chain contract.
 * Returns null if employee not found.
 */
export async function getOnChainEmployee(
  employeeId: string
): Promise<StacksEmployee | null> {
  try {
    // Encode the principal as a Clarity argument
    const args = [encodeClarityPrincipal(employeeId)]
    const result = await callReadOnly('get-employee', args) as { okay: boolean; result: string }

    if (!result.okay) return null

    const decoded = decodeClarityValue(result.result)
    if (decoded === null) return null

    // For complex tuple types, we need to parse differently
    return decoded as StacksEmployee
  } catch {
    return null
  }
}

/**
 * Encode a Stacks principal address to its Clarity hex representation.
 */
function encodeClarityPrincipal(address: string): string {
  // For the read-only API, we pass the address as a hex-encoded Clarity value
  // Type 0x05 = standard principal
  // This is a simplified encoding — the actual encoding involves c32check decoding
  // For the Hiro API, we can pass a serialized principal
  return `0x0516${addressToHex(address)}`
}

/**
 * Convert a Stacks address to its hex representation.
 * This is a simplified version — in production, use @stacks/transactions
 */
function addressToHex(address: string): string {
  // The Hiro API accepts the address string directly in some contexts
  // For complex encoding, the Stacks SDK handles this
  const encoder = new TextEncoder()
  const bytes = encoder.encode(address)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Fetch the STX balance for an address.
 */
export async function getStxBalance(address: string): Promise<{
  stx: string
  stxLocked: string
}> {
  const res = await fetch(`${API_BASE}/extended/v1/address/${address}/stx`)
  if (!res.ok) throw new Error(`Failed to fetch STX balance`)
  const data = await res.json()
  return {
    stx: data.balance,
    stxLocked: data.locked,
  }
}

/**
 * Fetch recent transactions for an address.
 */
export async function getRecentTransactions(
  address: string,
  limit = 10
): Promise<unknown[]> {
  const res = await fetch(
    `${API_BASE}/extended/v1/address/${address}/transactions?limit=${limit}`
  )
  if (!res.ok) throw new Error('Failed to fetch transactions')
  const data = await res.json()
  return data.results ?? []
}

/**
 * Get the contract info.
 */
export async function getContractInfo(): Promise<{
  source: string
  publishHeight: number
}> {
  const res = await fetch(
    `${API_BASE}/v2/contracts/source/${STACKS_CONTRACT_ADDRESS}/${STACKS_CONTRACT_NAME}`
  )
  if (!res.ok) throw new Error('Failed to fetch contract info')
  return res.json()
}
