import type { Response } from 'express'

/**
 * Standardised API response helpers for AyaPay backend.
 */

export function ok<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data })
}

export function created<T>(res: Response, data: T) {
  return ok(res, data, 201)
}

export function badRequest(res: Response, error: string) {
  return res.status(400).json({ success: false, error })
}

export function unauthorized(res: Response, error = 'Unauthorized') {
  return res.status(401).json({ success: false, error })
}

export function forbidden(res: Response, error = 'Forbidden') {
  return res.status(403).json({ success: false, error })
}

export function notFound(res: Response, error = 'Not found') {
  return res.status(404).json({ success: false, error })
}

export function serverError(res: Response, error = 'Internal server error') {
  return res.status(500).json({ success: false, error })
}
