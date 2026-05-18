import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

/**
 * Express middleware factory for request body validation using Zod schemas.
 * Returns 400 with a descriptive error message on validation failure.
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const error = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return res.status(400).json({ success: false, error })
    }
    req.body = result.data
    next()
  }
}

/**
 * Express middleware factory for query parameter validation using Zod schemas.
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      const error = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return res.status(400).json({ success: false, error })
    }
    req.query = result.data as typeof req.query
    next()
  }
}
