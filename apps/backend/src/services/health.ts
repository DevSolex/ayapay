import { prisma } from '../utils/prisma'
import { provider } from './celo'

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  services: {
    database: 'ok' | 'error'
    celo: 'ok' | 'error'
  }
}

/**
 * Run health checks against the database and Celo RPC provider.
 * Used by the /health endpoint to surface service status.
 */
export async function checkHealth(): Promise<HealthStatus> {
  const services: HealthStatus['services'] = {
    database: 'error',
    celo: 'error',
  }

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`
    services.database = 'ok'
  } catch {
    // database unreachable
  }

  // Celo RPC check
  try {
    await provider.getBlockNumber()
    services.celo = 'ok'
  } catch {
    // RPC unreachable
  }

  const allOk = Object.values(services).every((s) => s === 'ok')
  const anyOk = Object.values(services).some((s) => s === 'ok')

  return {
    status: allOk ? 'ok' : anyOk ? 'degraded' : 'down',
    timestamp: new Date().toISOString(),
    services,
  }
}
