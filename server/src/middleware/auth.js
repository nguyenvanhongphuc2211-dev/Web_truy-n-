import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'Cần đăng nhập' })
    return
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Phiên đăng nhập hết hạn. Hãy đăng nhập lại.' })
  }
}
