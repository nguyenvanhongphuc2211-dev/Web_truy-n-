import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { uploadsDir } from './lib/files.js'
import { errorHandler, notFound } from './middleware/error.js'
import { authRouter } from './routes/auth.js'
import { catalogRouter } from './routes/catalog.js'

export const app = express()

app.use(cors({ origin: env.corsOrigin, allowedHeaders: ['Content-Type', 'Authorization', 'x-reader'] }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(uploadsDir))
app.use('/api/files', express.static(uploadsDir))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'mochi-api' })
})

app.use('/api/auth', authRouter)
app.use('/api', catalogRouter)
app.use(notFound)
app.use(errorHandler)
