import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'

export const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = ALLOWED.has(path.extname(file.originalname).toLowerCase())
        ? path.extname(file.originalname).toLowerCase()
        : '.jpg'
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`)
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      const err = new Error('Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF.')
      err.status = 400
      cb(err)
      return
    }
    cb(null, true)
  },
}).single('file')

export function publicFileUrl(filename) {
  return `/api/files/${filename}`
}

export function cleanAssetUrls(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => String(item || '').trim())
    .filter((url) => url.startsWith('/uploads/') || url.startsWith('/api/files/') || /^https:\/\//.test(url))
    .slice(0, 80)
}
