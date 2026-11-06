import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
dotenv.config({ path: path.join(serverRoot, '.env') })

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  throw new Error('Thiếu MONGODB_URI trong server/.env')
}

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('Thiếu JWT_SECRET trong server/.env')
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri,
  jwtSecret,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  isProd: process.env.NODE_ENV === 'production',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER || 'MOCHI <noreply@localhost>',
}
