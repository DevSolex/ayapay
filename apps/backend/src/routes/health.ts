import { Router } from 'express'
import { checkHealth } from '../services/health'

const router = Router()

/**
 * GET /health
 * Returns service health status for database and Celo RPC.
 * Returns 503 if all services are down, 200 otherwise.
 */
router.get('/', async (_req, res) => {
  const health = await checkHealth()
  const statusCode = health.status === 'down' ? 503 : 200
  res.status(statusCode).json(health)
})

export default router
