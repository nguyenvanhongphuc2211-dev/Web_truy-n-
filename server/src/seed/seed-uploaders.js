import bcrypt from 'bcryptjs'
import { connectDb } from '../config/db.js'
import { env } from '../config/env.js'
import { Group } from '../models/Group.js'
import { Manga } from '../models/Manga.js'
import { User } from '../models/User.js'
import { groups } from '../../../src/data.js'

try {
  const db = await connectDb()
  console.log(`Seed tài khoản đăng truyện → ${db.name}`)

  const passwordHash = await bcrypt.hash(env.seedUploaderPassword, 10)
  const created = []
  const existed = []

  for (const group of groups) {
    await Group.findOneAndUpdate(
      { slug: group.id },
      {
        $setOnInsert: {
          slug: group.id,
          name: group.name,
          members: group.members,
          motto: group.motto,
        },
      },
      { upsert: true },
    )

    const email = `${group.id}@mochi.local`
    let user = await User.findOne({ email })
    if (user) {
      user.role = 'uploader'
      user.groupId = group.id
      user.emailVerified = true
      user.emailVerifyHash = ''
      user.emailVerifyExpires = null
      if (!user.name) user.name = group.name
      await user.save()
      existed.push(email)
    } else {
      user = await User.create({
        name: group.name,
        email,
        passwordHash,
        emailVerified: true,
        emailVerifyHash: '',
        role: 'uploader',
        groupId: group.id,
      })
      created.push(email)
    }

    await Manga.updateMany(
      { groupId: group.id, $or: [{ ownerId: null }, { ownerId: { $exists: false } }] },
      { $set: { ownerId: user._id } },
    )
  }

  await Manga.updateMany(
    { $or: [{ moderation: { $exists: false } }, { moderation: null }, { moderation: '' }] },
    { $set: { moderation: 'approved' } },
  )

  const adminEmail = 'admin@mochi.local'
  const adminHash = await bcrypt.hash(env.seedAdminPassword, 10)
  let admin = await User.findOne({ email: adminEmail })
  if (admin) {
    admin.role = 'admin'
    admin.emailVerified = true
    admin.emailVerifyHash = ''
    admin.name = admin.name || 'Quản trị MOCHI'
    await admin.save()
  } else {
    admin = await User.create({
      name: 'Quản trị MOCHI',
      email: adminEmail,
      passwordHash: adminHash,
      emailVerified: true,
      emailVerifyHash: '',
      role: 'admin',
      groupId: '',
    })
  }

  console.log(`Tạo mới: ${created.length}`)
  for (const email of created) console.log(`  ${email}`)
  console.log(`Đã có, cập nhật quyền: ${existed.length}`)
  for (const email of existed) console.log(`  ${email}`)
  console.log(`Mật khẩu nhóm (SEED_UPLOADER_PASSWORD): ${env.seedUploaderPassword}`)
  console.log(`Admin: ${adminEmail} / ${env.seedAdminPassword}`)
  console.log('Xem trong Atlas: database mochi → collection users')
  process.exit(0)
} catch (err) {
  console.error('Seed tài khoản đăng truyện thất bại:', err)
  process.exit(1)
}
