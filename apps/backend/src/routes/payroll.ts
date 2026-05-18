import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { authenticate, authorize, requireCompany } from '../middleware/auth'
import { validate, payrollSchema } from '../utils/validators'
import { executePayroll, executeBulkPayroll } from '../services/payment'
import type { AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authenticate, requireCompany)

// GET /api/payroll
router.get('/', async (req: AuthRequest, res) => {
  const { status, employeeId, token } = req.query
  const companyId = req.user!.companyId!

  const payrolls = await prisma.payroll.findMany({
    where: {
      companyId,
      ...(status ? { status: status as string } : {}),
      ...(employeeId ? { employeeId: employeeId as string } : {}),
      ...(token ? { token: token as string } : {}),
    },
    include: { employee: { select: { name: true, email: true, walletAddress: true } } },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ success: true, data: payrolls })
})

// POST /api/payroll — create payroll entry
router.post('/', authorize('ADMIN', 'HR_MANAGER'), async (req: AuthRequest, res) => {
  const parsed = validate(payrollSchema, req.body)
  if ('error' in parsed) return res.status(400).json({ success: false, error: parsed.error })

  const companyId = req.user!.companyId!
  const { employeeId, amount, token, paymentDate } = parsed.data

  const employee = await prisma.employee.findFirst({ where: { id: employeeId, companyId } })
  if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' })
  if (employee.status !== 'ACTIVE') return res.status(400).json({ success: false, error: 'Employee is not active' })

  const payroll = await prisma.payroll.create({
    data: { companyId, employeeId, amount, token, paymentDate: new Date(paymentDate), status: 'PENDING' },
    include: { employee: { select: { name: true, email: true } } },
  })

  res.status(201).json({ success: true, data: payroll })
})

// POST /api/payroll/:id/approve
router.post('/:id/approve', authorize('ADMIN'), async (req: AuthRequest, res) => {
  const payroll = await prisma.payroll.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId! } })
  if (!payroll) return res.status(404).json({ success: false, error: 'Payroll not found' })
  if (payroll.status !== 'PENDING') return res.status(400).json({ success: false, error: 'Only pending payrolls can be approved' })

  const updated = await prisma.payroll.update({ where: { id: req.params.id }, data: { status: 'APPROVED' } })
  res.json({ success: true, data: updated })
})

// POST /api/payroll/:id/execute
router.post('/:id/execute', authorize('ADMIN'), async (req: AuthRequest, res) => {
  const payroll = await prisma.payroll.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId! } })
  if (!payroll) return res.status(404).json({ success: false, error: 'Payroll not found' })

  try {
    const result = await executePayroll(req.params.id as string)
    res.json({ success: result.success, data: result, error: result.error })
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Execution failed' })
  }
})

// POST /api/payroll/bulk-execute
router.post('/bulk-execute', authorize('ADMIN'), async (req: AuthRequest, res) => {
  const companyId = req.user!.companyId!
  const result = await executeBulkPayroll(companyId)
  res.json({ success: true, data: result })
})

// POST /api/payroll/:id/cancel
router.post('/:id/cancel', authorize('ADMIN', 'HR_MANAGER'), async (req: AuthRequest, res) => {
  const payroll = await prisma.payroll.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId! } })
  if (!payroll) return res.status(404).json({ success: false, error: 'Payroll not found' })
  if (payroll.status === 'EXECUTED') return res.status(400).json({ success: false, error: 'Cannot cancel executed payroll' })

  const updated = await prisma.payroll.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } })
  res.json({ success: true, data: updated })
})

export default router
