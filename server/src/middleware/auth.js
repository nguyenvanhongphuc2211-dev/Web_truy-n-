import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

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

export async function requireVerified(req, res, next) {
  requireAuth(req, res, async () => {
    try {
      const user = await User.findById(req.userId)
      if (!user) {
        res.status(401).json({ error: 'Tài khoản không còn tồn tại.' })
        return
      }
      if (!user.isEmailVerified()) {
        res.status(403).json({
          error: 'Email chưa xác minh. Hãy nhập mã đã gửi tới hộp thư.',
          needsVerification: true,
          email: user.email,
        })
        return
      }
      req.user = user
      next()
    } catch (err) {
      next(err)
    }
  })
}

export async function requireAdmin(req, res, next) {
  requireVerified(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Chỉ tài khoản quản trị mới duyệt được truyện.' })
      return
    }
    next()
  })
}
