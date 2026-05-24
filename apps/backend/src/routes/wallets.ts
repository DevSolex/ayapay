import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { authenticate } from '../middleware/auth'
import { getAccountBalance as getCeloBalance, isValidCeloAddress } from '../services/celo'
import { getAccountBalance as getStacksBalance, isValidStacksAddress } from '../services/stacks'
import type { AuthRequest } from '../middleware/auth'
import type { SupportedChain } from '../types'

const router = Router()

router.use(authenticate)

// POST /api/wallets/connect — save wallet address
router.post('/connect', async (req: AuthRequest, res) => {
  const { address, network } = req.body
  if (!address) return res.status(400).json({ success: false, error: 'Address required' })

  const chain: SupportedChain = network || 'CELO'

  // Validate address based on chain
  if (chain === 'CELO' && !isValidCeloAddress(address)) {
    return res.status(400).json({ success: false, error: 'Invalid Celo address' })
  }
  if (chain === 'STACKS' && !isValidStacksAddress(address)) {
    return res.status(400).json({ success: false, error: 'Invalid Stacks address' })
  }

  const wallet = await prisma.wallet.upsert({
    where: { userId: req.user!.userId },
    update: { address, network: chain },
    create: { userId: req.user!.userId, address, network: chain },
  })

  res.json({ success: true, data: wallet })
})

// GET /api/wallets/balance/:address?chain=CELO|STACKS
router.get('/balance/:address', async (req: AuthRequest, res) => {
  const address = req.params.address as string
  const chain = (req.query.chain as SupportedChain) || 'CELO'

  let balances: Record<string, string> = {}

  if (chain === 'CELO') {
    if (!isValidCeloAddress(address)) {
      return res.status(400).json({ success: false, error: 'Invalid Celo address' })
    }
    balances = await getCeloBalance(address)
  } else if (chain === 'STACKS') {
    if (!isValidStacksAddress(address)) {
      return res.status(400).json({ success: false, error: 'Invalid Stacks address' })
    }
    balances = await getStacksBalance(address)
  } else {
    return res.status(400).json({ success: false, error: 'Unsupported chain' })
  }

  res.json({ success: true, data: balances })
})

// GET /api/wallets/me
router.get('/me', async (req: AuthRequest, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.userId } })
  res.json({ success: true, data: wallet })
})

export default router
