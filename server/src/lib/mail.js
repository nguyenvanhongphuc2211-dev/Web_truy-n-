import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

function transporter() {
  if (!env.smtpUser || !env.smtpPass) return null
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  })
}

export async function sendVerifyEmail(email, code) {
  if (!env.isProd) {
    console.log(`[MOCHI] Mã xác minh ${email}: ${code}`)
  }
  const mailer = transporter()
  if (!mailer) return false
  await mailer.sendMail({
    from: env.mailFrom,
    to: email,
    subject: 'Mã xác minh email MOCHI',
    text: `Mã xác minh MOCHI của bạn là ${code}. Mã hết hạn sau 15 phút. Nếu bạn không tạo tài khoản, hãy bỏ qua thư này.`,
    html: `<p>Mã xác minh MOCHI của bạn là <b style="font-size:20px;letter-spacing:4px">${code}</b>.</p><p>Mã hết hạn sau 15 phút. Nếu bạn không tạo tài khoản, hãy bỏ qua thư này.</p>`,
  })
  return true
}
