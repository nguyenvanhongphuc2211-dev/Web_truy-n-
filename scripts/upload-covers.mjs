import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
const imageDir = process.env.IMAGE_DIR
const outFile = path.resolve('src/posters.js')

if (!cloudName || !apiKey || !apiSecret || !imageDir) {
  console.error('Missing Cloudinary credentials or IMAGE_DIR')
  process.exit(1)
}

const authors = ['lan-anh', 'mio-k', 'haru-nguyen', 'sora-lee', 'yuki-tran', 'kenji-pham', 'nao-vo', 'rin-dao']
const groups = ['may-hong', 'dem-khuya', 'ban-cong', 'pho-nho', 'khong-ngu']
const translators = ['Hana', 'K.', 'Mochi', 'Lynn', 'Yuki', 'Haru', 'Nao', 'Rin']

function sign(params) {
  const payload = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&')
  return crypto.createHash('sha1').update(payload + apiSecret).digest('hex')
}

async function uploadOne(filePath, publicId) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params = { folder: 'mochi-covers', overwrite: 'true', public_id: publicId, timestamp }
  const body = new FormData()
  body.append('file', new Blob([fs.readFileSync(filePath)]), path.basename(filePath))
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('public_id', publicId)
  body.append('folder', 'mochi-covers')
  body.append('overwrite', 'true')
  body.append('signature', sign(params))
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error?.message || response.statusText)
  return data.secure_url
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0
  async function run() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: limit }, run))
  return results
}

const files = fs.readdirSync(imageDir)
  .filter((name) => name.toLowerCase().endsWith('.webp'))
  .sort((a, b) => b.localeCompare(a))

console.log(`Uploading ${files.length} images`)
let done = 0
const uploaded = await mapPool(files, 4, async (name, index) => {
  const publicId = path.parse(name).name
  let url
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      url = await uploadOne(path.join(imageDir, name), publicId)
      break
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
    }
  }
  if (!url) throw lastError
  done += 1
  if (done % 10 === 0 || done === files.length) console.log(`${done}/${files.length}`)
  return { name, url, index }
})

const mangas = uploaded.map((item, index) => {
  const number = index + 1
  return {
    id: path.parse(item.name).name,
    title: `Truyện ${number}`,
    alt: item.name,
    authorId: authors[index % authors.length],
    groupId: groups[index % groups.length],
    translator: translators[index % translators.length],
    genres: [],
    views: 200 + ((index * 97) % 5000),
    likes: 20 + (index % 400),
    follows: 10 + (index % 250),
    status: 'Đang ra',
    updated: index < 8 ? `${index + 1} giờ trước` : `${index} ngày trước`,
    hue: (index * 37) % 360,
    badge: index < 3 ? 'HOT' : index < 8 ? 'MỚI' : null,
    kind: 'Manga',
    chapterCount: 1,
    lead: 'Nhân vật chính',
    partner: 'Người đồng hành',
    blurb: 'Truyện được tạo từ ảnh bìa trong thư viện của bạn.',
    description: 'Bộ này được tạo từ một ảnh bìa đã tải lên Cloudinary. Nội dung chương là bản đọc mẫu trên giao diện.',
    lineA: 'Ảnh bìa này là của bộ truyện vừa được thêm.',
    lineB: 'Mở chương để đọc thử phần hội thoại mẫu.',
    coverUrl: item.url,
  }
})

fs.writeFileSync(outFile, `export const posterMangas = ${JSON.stringify(mangas, null, 2)}\n`)
console.log(`Wrote ${mangas.length} stories`)
