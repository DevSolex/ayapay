import cors from 'cors'
import { config } from '../utils/config'

const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:3000',
  'http://localhost:3001',
]

/**
 * Configured CORS middleware for AyaPay API.
 * Allows credentials and restricts origins to known frontend URLs.
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
