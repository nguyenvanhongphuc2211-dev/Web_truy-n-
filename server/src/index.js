import { connectDb } from './config/db.js'
import { env } from './config/env.js'
import { app } from './app.js'

try {
  await connectDb()
  app.listen(env.port, () => {
    console.log(`MOCHI API http://localhost:${env.port}`)
  })
} catch (err) {
  console.error('Không kết nối được MongoDB:', err.message)
  process.exit(1)
}
