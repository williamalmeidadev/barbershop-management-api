import type { Request, Response, NextFunction } from 'express'

type RateLimiterOptions = {
  windowMs: number
  max: number
  message?: string
  keyPrefix?: string
  keyGenerator?: (req: Request) => string
}

type Entry = {
  count: number
  resetAt: number
}

const getClientKey = (req: Request, prefix = '') => {
  const xff = req.headers['x-forwarded-for']
  const ip = Array.isArray(xff) ? xff[0] : xff?.split(',')[0]?.trim()
  const addr = ip || req.ip || req.socket.remoteAddress || 'unknown'
  return `${prefix}${addr}`
}

export const createRateLimiter = ({ windowMs, max, message, keyPrefix = '', keyGenerator }: RateLimiterOptions) => {
  const store = new Map<string, Entry>()

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now()
    const customKey = keyGenerator ? keyGenerator(req) : ''
    const key = customKey ? `${keyPrefix}${customKey}` : getClientKey(req, keyPrefix)
    const entry = store.get(key)

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    entry.count += 1
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      res.setHeader('Retry-After', String(retryAfter))
      return res.status(429).json({
        error: message || 'Muitas tentativas. Tente novamente em instantes.'
      })
    }

    return next()
  }
}
