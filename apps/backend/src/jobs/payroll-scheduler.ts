import cron from 'node-cron'
import { prisma } from '../utils/prisma'
import { executePayroll } from '../services/payment'

// Run on the 1st of every month at 9:00 AM UTC
export function startPayrollScheduler() {
  cron.schedule('0 9 1 * *', async () => {
    console.log('[Scheduler] Running monthly payroll...')
    await runMonthlyPayroll()
  })

  // Retry failed payments every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Scheduler] Retrying failed payrolls...')
    await retryFailedPayrolls()
  })

  console.log('[Scheduler] Payroll scheduler started')
}

async function runMonthlyPayroll() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Find all approved payrolls due this month
  const duePayrolls = await prisma.payroll.findMany({
    where: {
      status: 'APPROVED',
      paymentDate: { gte: startOfMonth, lte: endOfMonth },
    },
    include: { employee: { select: { status: true } } },
  })

  console.log(`[Scheduler] Found ${duePayrolls.length} payrolls to execute`)

  for (const payroll of duePayrolls) {
    if (payroll.employee.status !== 'ACTIVE') continue
    try {
      const result = await executePayroll(payroll.id)
      console.log(`[Scheduler] Payroll ${payroll.id}: ${result.success ? 'SUCCESS' : 'FAILED'} ${result.txHash || result.error}`)
    } catch (err) {
      console.error(`[Scheduler] Payroll ${payroll.id} error:`, err)
    }
  }
}

async function retryFailedPayrolls() {
  const failedPayrolls = await prisma.payroll.findMany({
    where: { status: 'FAILED', retryCount: { lt: 3 } },
    include: { employee: { select: { status: true } } },
  })

  for (const payroll of failedPayrolls) {
    if (payroll.employee.status !== 'ACTIVE') continue
    // Reset to approved so executePayroll can process it
    await prisma.payroll.update({ where: { id: payroll.id }, data: { status: 'APPROVED' } })
    const result = await executePayroll(payroll.id)
    console.log(`[Scheduler] Retry ${payroll.id}: ${result.success ? 'SUCCESS' : 'FAILED'}`)
  }
}
