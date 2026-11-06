import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { sendVerifyEmail } from '../lib/mail.js'
import { hashOtp, makeOtp, otpMatches } from '../lib/otp.js'
import { User } from '../models/User.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_MS = 15 * 60 * 1000
const RESEND_MS = 60 * 1000

function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, env.jwtSecret, { expiresIn: '7d' })
}

function authPayload(user) {
  return { token: signToken(user), user: user.toPublic() }
}

function readEmail(value) {
  return String(value || '').trim().toLowerCase()
}

async function issueCode(user) {
  const now = Date.now()
  if (user.emailVerifySentAt && now - user.emailVerifySentAt.getTime() < RESEND_MS) {
    const wait = Math.ceil((RESEND_MS - (now - user.emailVerifySentAt.getTime())) / 1000)
    const err = new Error(`Đợi ${wait} giây rồi gửi lại mã.`)
    err.status = 429
    throw err
  }
  const code = makeOtp()
  user.emailVerified = false
  user.emailVerifyHash = hashOtp(code)
  user.emailVerifyExpires = new Date(now + OTP_MS)
  user.emailVerifySentAt = new Date(now)
  await user.save()
  const mailed = await sendVerifyEmail(user.email, code)
  return { emailed: mailed, email: user.email, needsVerification: true }
}

export async function register(req, res, next) {
  try {
    const name = String(req.body?.name || '').trim()
    const email = readEmail(req.body?.email)
    const password = String(req.body?.password || '')
    const confirmPassword = String(req.body?.confirmPassword || '')
    if (name.length < 2) {
      res.status(400).json({ error: 'Tên hiển thị cần ít nhất 2 ký tự.' })
      return
    }
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'Email không hợp lệ.' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Mật khẩu cần ít nhất 6 ký tự.' })
      return
    }
    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Mật khẩu xác nhận không khớp.' })
      return
    }
    const exists = await User.findOne({ email })
    if (exists?.isEmailVerified()) {
      res.status(409).json({ error: 'Email này đã có tài khoản.' })
      return
    }
    if (exists && !exists.isEmailVerified()) {
      const sent = await issueCode(exists)
      res.json({ ...sent, resent: true })
      return
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      passwordHash,
      emailVerified: false,
      emailVerifyHash: 'pending',
    })
    const sent = await issueCode(user)
    res.status(201).json(sent)
  } catch (err) {
    if (err?.code === 11000) {
      res.status(409).json({ error: 'Email này đã có tài khoản.' })
      return
    }
    if (err.status) {
      res.status(err.status).json({ error: err.message, needsVerification: true })
      return
    }
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const email = readEmail(req.body?.email)
    const password = String(req.body?.password || '')
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' })
      return
    }
    if (!user.isEmailVerified()) {
      res.status(403).json({
        error: 'Email chưa xác minh. Nhập mã đã gửi tới hộp thư.',
        needsVerification: true,
        email: user.email,
      })
      return
    }
    res.json(authPayload(user))
  } catch (err) {
    next(err)
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const email = readEmail(req.body?.email)
    const code = String(req.body?.code || '').replace(/\D/g, '')
    const user = await User.findOne({ email })
    if (!user) {
      res.status(400).json({ error: 'Mã không đúng hoặc đã hết hạn.' })
      return
    }
    if (user.isEmailVerified() && !user.emailVerifyHash) {
      res.json(authPayload(user))
      return
    }
    if (!user.emailVerifyExpires || user.emailVerifyExpires.getTime() < Date.now()) {
      res.status(400).json({ error: 'Mã đã hết hạn. Hãy gửi lại mã mới.' })
      return
    }
    if (!otpMatches(code, user.emailVerifyHash)) {
      res.status(400).json({ error: 'Mã xác minh không đúng.' })
      return
    }
    user.emailVerified = true
    user.emailVerifyHash = ''
    user.emailVerifyExpires = null
    await user.save()
    res.json(authPayload(user))
  } catch (err) {
    next(err)
  }
}

export async function resendVerify(req, res, next) {
  try {
    const email = readEmail(req.body?.email)
    const user = await User.findOne({ email })
    if (!user) {
      res.json({ ok: true, email })
      return
    }
    if (user.isEmailVerified()) {
      res.json({ ok: true, email, alreadyVerified: true })
      return
    }
    const sent = await issueCode(user)
    res.json(sent)
  } catch (err) {
    if (err.status) {
      res.status(err.status).json({ error: err.message, needsVerification: true })
      return
    }
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      res.status(401).json({ error: 'Tài khoản không còn tồn tại.' })
      return
    }
    res.json(user.toPublic())
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req, res, next) {
  try {
    const currentPassword = String(req.body?.currentPassword || '')
    const password = String(req.body?.password || '')
    if (password.length < 6) {
      res.status(400).json({ error: 'Mật khẩu mới cần ít nhất 6 ký tự.' })
      return
    }
    const user = await User.findById(req.userId)
    if (!user) {
      res.status(401).json({ error: 'Tài khoản không còn tồn tại.' })
      return
    }
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      res.status(400).json({ error: 'Mật khẩu hiện tại không đúng.' })
      return
    }
    user.passwordHash = await bcrypt.hash(password, 10)
    await user.save()
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}
