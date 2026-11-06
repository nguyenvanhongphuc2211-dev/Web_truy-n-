import { Router } from 'express'
import { changePassword, login, me, register, resendVerify, verifyEmail } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/verify-email', verifyEmail)
authRouter.post('/resend-verify', resendVerify)
authRouter.get('/me', requireAuth, me)
authRouter.patch('/password', requireAuth, changePassword)
