import { isAddress } from 'ethers'
import { transferToken as transferCeloToken, isValidCeloAddress } from './celo'
import { transferToken as transferStacksToken, isValidStacksAddress } from './stacks'
import { prisma } from '../utils/prisma'
import type { SupportedChain } from '../types'

export interface PaymentResult {
  txHash: string
  success: boolean
  error?: string
}

export async function executePayment(
  recipientAddress: string,
  amount: string,
  token: string,
  chain: SupportedChain
): Promise<PaymentResult> {
  const amountFloat = parseFloat(amount)
  if (isNaN(amountFloat) || amountFloat <= 0) {
    throw new Error('Invalid payment amount')
  }

  try {
    let txHash: string

    if (chain === 'CELO') {
      if (!isValidCeloAddress(recipientAddress)) {
        throw new Error('Invalid Celo address')
      }
      txHash = await transferCeloToken(recipientAddress, amount, token)
    } else if (chain === 'STACKS') {
      if (!isValidStacksAddress(recipientAddress)) {
        throw new Error('Invalid Stacks address')
      }
      txHash = await transferStacksToken(recipientAddress, amount, token)
    } else {
      throw new Error(`Unsupported chain: ${chain}`)
    }

    return { txHash, success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment failed'
    return { txHash: '', success: false, error: message }
  }
}

// Legacy function for backward compatibility
export async function executeCeloPayment(
  recipientAddress: string,
  amount: string,
  token: string
): Promise<PaymentResult> {
  return executePayment(recipientAddress, amount, token, 'CELO')
}

export async function executePayroll(payrollId: string): Promise<PaymentResult> {
  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
    include: { employee: true },
  })

  if (!payroll) throw new Error('Payroll not found')
  if (payroll.status === 'EXECUTED') throw new Error('Payroll already executed')
  if (payroll.status === 'CANCELLED') throw new Error('Payroll is cancelled')

  // Mark as processing
  await prisma.payroll.update({ where: { id: payrollId }, data: { status: 'APPROVED' } })

  const result = await executePayment(
    payroll.employee.walletAddress,
    payroll.amount.toString(),
    payroll.token,
    payroll.chain
  )

  await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      status: result.success ? 'EXECUTED' : 'FAILED',
      txHash: result.txHash || null,
      executedAt: result.success ? new Date() : null,
      retryCount: result.success ? payroll.retryCount : payroll.retryCount + 1,
    },
  })

  return result
}

export async function executeBulkPayroll(companyId: string): Promise<{ succeeded: number; failed: number }> {
  const pendingPayrolls = await prisma.payroll.findMany({
    where: { companyId, status: 'APPROVED' },
    include: { employee: { select: { walletAddress: true, status: true } } },
  })

  let succeeded = 0
  let failed = 0

  for (const payroll of pendingPayrolls) {
    if (payroll.employee.status !== 'ACTIVE') { failed++; continue }
    const result = await executePayroll(payroll.id)
    result.success ? succeeded++ : failed++
  }

  return { succeeded, failed }
}
