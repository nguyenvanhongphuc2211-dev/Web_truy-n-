import crypto from 'node:crypto'

export function makeOtp() {
  return String(crypto.randomInt(100000, 1_000_000))
}

export function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code || '').trim()).digest('hex')
}

export function otpMatches(code, storedHash) {
  if (!storedHash) return false
  const next = hashOtp(code)
  const a = Buffer.from(next)
  const b = Buffer.from(String(storedHash))
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
