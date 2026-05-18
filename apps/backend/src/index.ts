import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import employeeRoutes from './routes/employees'
import payrollRoutes from './routes/payroll'
import analyticsRoutes from './routes/analytics'
import walletRoutes from './routes/wallets'
import { startPayrollScheduler } from './jobs/payroll-scheduler'
import { errorHandler, notFound } from './middleware/error'
import { checkHealth } from './services/health'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://ayapay.vercel.app',
  'http://localhost:3001',
]

app.use(helmet())
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(null, true) // permissive for now — tighten in production
  },
  credentials: true,
}))
app.use(compression() as express.RequestHandler)
app.use(morgan('dev'))
app.use(express.json({ limit: '10kb' }))

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' }))

app.get('/health', async (_req, res) => {
  const health = await checkHealth()
  const statusCode = health.status === 'down' ? 503 : 200
  res.status(statusCode).json(health)
})

app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/payroll', payrollRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/wallets', walletRoutes)

app.use(notFound)
app.use(errorHandler)

// Only start the HTTP server when running directly (not in serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`AyaPay API running on port ${PORT}`)
    startPayrollScheduler()
  })
}

export default app
