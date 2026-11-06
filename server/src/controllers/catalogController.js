import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { Author } from '../models/Author.js'
import { Genre } from '../models/Genre.js'
import { Group } from '../models/Group.js'
import { Manga } from '../models/Manga.js'
import { Read } from '../models/Read.js'
import { User } from '../models/User.js'
import { cleanAssetUrls } from '../lib/files.js'

const HIDDEN = ['draft', 'pending', 'rejected']
const LIVE = { moderation: { $nin: HIDDEN } }

function isLive(manga) {
  return !HIDDEN.includes(manga?.moderation)
}

function owns(user, manga) {
  return Boolean(user && manga?.ownerId && String(manga.ownerId) === String(user._id || user.id))
}

function canSee(user, manga) {
  return isLive(manga) || user?.role === 'admin' || owns(user, manga)
}

async function viewer(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (!payload.sub) return null
    return User.findById(payload.sub)
  } catch {
    return null
  }
}

function readerKeyFrom(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret)
      if (payload.sub) return `user:${payload.sub}`
    } catch {
      /* khách hoặc phiên hết hạn vẫn được tính theo máy */
    }
  }
  const guest = String(req.headers['x-reader'] || '').trim()
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(guest)) return ''
  return `guest:${guest}`
}

async function noteOnce(fields) {
  try {
    await Read.create(fields)
    return true
  } catch (err) {
    if (err?.code === 11000) return false
    throw err
  }
}

function hotScore(manga, period) {
  if (period === 'day') return manga.likes + manga.follows
  if (period === 'week') return manga.views * 0.3 + manga.likes * 8
  if (period === 'month') return manga.views
  return manga.views + manga.likes * 20 + manga.follows * 10
}

function toPublicManga(doc, { withChapters = false, withBody = false } = {}) {
  const manga = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc }
  const chapters = (manga.chapters || []).map((chapter) => {
    if (withBody) return chapter
    const { lines, paragraphs, ...meta } = chapter
    return meta
  })
  return {
    id: manga.slug,
    title: manga.title,
    alt: manga.alt,
    authorId: manga.authorId,
    authorName: manga.authorName,
    groupId: manga.groupId,
    groupName: manga.groupName,
    translator: manga.translator,
    genres: manga.genres,
    views: manga.views,
    likes: manga.likes,
    follows: manga.follows,
    status: manga.status,
    updated: manga.updated,
    hue: manga.hue,
    badge: manga.badge,
    kind: manga.kind,
    chapterCount: manga.chapterCount || chapters.length,
    lead: manga.lead,
    partner: manga.partner,
    blurb: manga.blurb,
    description: manga.description,
    lineA: manga.lineA,
    lineB: manga.lineB,
    coverUrl: manga.coverUrl,
    ownerId: manga.ownerId ? String(manga.ownerId) : '',
    moderation: manga.moderation || 'approved',
    reviewNote: manga.reviewNote || '',
    ...(withChapters ? { chapters } : {}),
  }
}

const PAGE_SIZE = 24
const STATUS_VALUES = {
  'chua-bat-dau': ['Chưa bắt đầu'],
  'dang-lam': ['Đang làm', 'Đang ra'],
  hoan: ['Hoãn'],
  'da-dung': ['Đã dừng', 'Tạm dừng'],
  'hoan-thanh': ['Hoàn thành'],
}

function fold(value) {
  return String(value || '')
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function updatedRank(text = '') {
  const value = String(text)
  const hour = value.match(/(\d+)\s*giờ/)
  if (hour) return Number(hour[1])
  const day = value.match(/(\d+)\s*ngày/)
  if (day) return 24 * Number(day[1])
  if (/hôm nay|vừa/i.test(value)) return 0
  return 900
}

function addedRank(doc) {
  const match = String(doc.slug || '').match(/(\d{10,})/)
  return match ? Number(match[1]) : 0
}

function statusId(raw) {
  const found = Object.entries(STATUS_VALUES).find(([, values]) => values.includes(raw))
  return found ? found[0] : 'dang-lam'
}

function latestChapters(chapters) {
  return [...(chapters || [])]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 2)
    .map((chapter) => ({ id: chapter.id, title: chapter.title || '', time: chapter.time || '' }))
}

function authorLabel(name) {
  return name === 'Chưa ghi trên bìa' ? 'đang cập nhật' : name
}

function toCard(doc, authorMap, groupMap) {
  const authorName = authorLabel(doc.authorName || authorMap.get(doc.authorId) || '')
  const groupName = doc.groupName || groupMap.get(doc.groupId) || ''
  return {
    id: doc.slug,
    title: doc.title,
    alt: doc.alt || '',
    authorId: doc.authorId || '',
    authorName,
    groupId: doc.groupId || '',
    groupName,
    views: doc.views || 0,
    likes: doc.likes || 0,
    follows: doc.follows || 0,
    hue: doc.hue,
    badge: doc.badge || '',
    coverUrl: doc.coverUrl || '',
    chapters: latestChapters(doc.chapters),
  }
}

async function searchPage(query) {
  const [docs, authors, groups] = await Promise.all([
    Manga.find(LIVE)
    .select({
      slug: 1,
      title: 1,
      alt: 1,
      blurb: 1,
      authorId: 1,
      authorName: 1,
      groupId: 1,
      groupName: 1,
      genres: 1,
      views: 1,
      likes: 1,
      follows: 1,
      status: 1,
      updated: 1,
      hue: 1,
      badge: 1,
      kind: 1,
      coverUrl: 1,
      rating: 1,
      ratingCount: 1,
      'chapters.id': 1,
      'chapters.title': 1,
      'chapters.time': 1,
    })
    .lean(),
    Author.find().select('slug name').lean(),
    Group.find().select('slug name').lean(),
  ])
  const authorMap = new Map(authors.map((author) => [author.slug, author.name]))
  const groupMap = new Map(groups.map((group) => [group.slug, group.name]))

  const statusCounts = Object.fromEntries(Object.keys(STATUS_VALUES).map((id) => [id, 0]))
  for (const doc of docs) statusCounts[statusId(doc.status)] += 1

  const needle = fold(query.q || '')
  const genres = String(query.tl || '').split(',').map((item) => item.trim()).filter(Boolean)
  const statuses = String(query.tt || '').split(',').map((item) => item.trim()).filter((id) => STATUS_VALUES[id])
  let textSlugs = null
  if (query.chu === '1') {
    const rows = await Manga.find({
      $or: [{ kind: 'Tiểu thuyết' }, { 'chapters.paragraphs.0': { $exists: true } }],
    }).select('slug').lean()
    textSlugs = new Set(rows.map((row) => row.slug))
  }

  const matched = docs.filter((doc) => {
    if (needle && !fold(`${doc.title || ''} ${doc.alt || ''} ${doc.blurb || ''}`).includes(needle)) return false
    if (genres.length && !genres.some((slug) => (doc.genres || []).includes(slug))) return false
    if (statuses.length && !statuses.includes(statusId(doc.status))) return false
    if (textSlugs && !textSlugs.has(doc.slug)) return false
    return true
  })

  const scoreOf = (doc) => {
    const count = Number(doc.ratingCount) || 0
    const score = Number(doc.rating)
    if (!count || !Number.isFinite(score)) return 0
    return score
  }
  const sort = query.sap || 'cap-nhat'
  matched.sort((a, b) => {
    if (sort === 'xem') return (b.views || 0) - (a.views || 0)
    if (sort === 'thich') return (b.likes || 0) - (a.likes || 0)
    if (sort === 'hot') return hotScore(b, 'all') - hotScore(a, 'all')
    if (sort === 'danh-gia') return scoreOf(b) - scoreOf(a) || (b.likes || 0) - (a.likes || 0)
    if (sort === 'theo-doi') return (b.follows || 0) - (a.follows || 0)
    if (sort === 'moi') return addedRank(b) - addedRank(a)
    return updatedRank(a.updated) - updatedRank(b.updated)
  })

  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, Number(query.page) || 1), pages)
  const start = (page - 1) * PAGE_SIZE
  return {
    items: matched.slice(start, start + PAGE_SIZE).map((doc) => toCard(doc, authorMap, groupMap)),
    total: matched.length,
    page,
    pageSize: PAGE_SIZE,
    pages,
    statusCounts,
  }
}

export async function listMangas(req, res, next) {
  try {
    if (req.query.page != null && req.query.page !== '') {
      res.json(await searchPage(req.query))
      return
    }

    const { q, genre, sort, period, limit } = req.query
    const filter = {}
    if (genre) filter.genres = genre
    if (q) filter.title = { $regex: q, $options: 'i' }

    const docs = await Manga.find({ ...filter, ...LIVE }).select('-chapters.lines -chapters.paragraphs').lean()
    const periodKey = period === 'day' || period === 'week' || period === 'month' ? period : 'all'
    const sorted = docs.sort((a, b) => {
      if (sort === 'new') return String(b.updated || '').localeCompare(String(a.updated || ''))
      if (sort === 'views') return (b.views || 0) - (a.views || 0)
      return hotScore(b, periodKey) - hotScore(a, periodKey)
    })

    const max = Math.min(Number(limit) || sorted.length, 400)
    res.json(sorted.slice(0, max).map((doc) => toPublicManga(doc, { withChapters: true })))
  } catch (err) {
    next(err)
  }
}

export async function getManga(req, res, next) {
  try {
    const manga = await Manga.findOne({ slug: req.params.id }).lean()
    if (!manga) {
      res.status(404).json({ error: 'Không tìm thấy truyện' })
      return
    }
    const user = await viewer(req)
    if (!canSee(user, manga)) {
      res.status(404).json({ error: 'Không tìm thấy truyện' })
      return
    }
    res.json(toPublicManga(manga, { withChapters: true }))
  } catch (err) {
    next(err)
  }
}

export async function getChapter(req, res, next) {
  try {
    const manga = await Manga.findOne({ slug: req.params.id }).lean()
    if (!manga) {
      res.status(404).json({ error: 'Không tìm thấy truyện' })
      return
    }
    const user = await viewer(req)
    if (!canSee(user, manga)) {
      res.status(404).json({ error: 'Không tìm thấy truyện' })
      return
    }
    const chapterId = Number(req.params.chapter)
    const chapter = (manga.chapters || []).find((item) => item.id === chapterId)
    if (!chapter) {
      res.status(404).json({ error: 'Không tìm thấy chương' })
      return
    }
    res.json({
      manga: toPublicManga(manga),
      chapter,
    })
  } catch (err) {
    next(err)
  }
}

export async function listGenres(_req, res, next) {
  try {
    const [genres, counts] = await Promise.all([
      Genre.find().sort({ name: 1 }).lean(),
      Manga.aggregate([{ $match: LIVE }, { $unwind: '$genres' }, { $group: { _id: '$genres', count: { $sum: 1 } } }]),
    ])
    const countMap = new Map(counts.map((row) => [row._id, row.count]))
    res.json(genres.map((genre) => ({ slug: genre.slug, name: genre.name, count: countMap.get(genre.slug) || 0 })))
  } catch (err) {
    next(err)
  }
}

export async function listAuthors(_req, res, next) {
  try {
    const authors = await Author.find().sort({ name: 1 }).lean()
    res.json(authors.map((author) => ({ id: author.slug, name: author.name })))
  } catch (err) {
    next(err)
  }
}

export async function getAuthor(req, res, next) {
  try {
    const author = await Author.findOne({ slug: req.params.id }).lean()
    if (!author) {
      res.status(404).json({ error: 'Không tìm thấy tác giả' })
      return
    }
    const works = await Manga.find({ authorId: author.slug, ...LIVE }).select('-chapters.lines -chapters.paragraphs').lean()
    res.json({
      id: author.slug,
      name: author.name,
      works: works.map((doc) => toPublicManga(doc, { withChapters: true })),
    })
  } catch (err) {
    next(err)
  }
}

export async function listGroups(_req, res, next) {
  try {
    const [groups, uploaders] = await Promise.all([
      Group.find().sort({ name: 1 }).lean(),
      User.find({ role: 'uploader', groupId: { $ne: '' } }).select('email name groupId').lean(),
    ])
    const byGroup = new Map(uploaders.map((user) => [user.groupId, user]))
    res.json(
      groups.map((group) => {
        const account = byGroup.get(group.slug)
        return {
          id: group.slug,
          name: group.name,
          members: group.members,
          motto: group.motto,
          accountEmail: account?.email || '',
          accountName: account?.name || '',
        }
      }),
    )
  } catch (err) {
    next(err)
  }
}

export async function getGroup(req, res, next) {
  try {
    const group = await Group.findOne({ slug: req.params.id }).lean()
    if (!group) {
      res.status(404).json({ error: 'Không tìm thấy nhóm dịch' })
      return
    }
    const [works, account] = await Promise.all([
      Manga.find({ groupId: group.slug, ...LIVE }).select('-chapters.lines -chapters.paragraphs').lean(),
      User.findOne({ role: 'uploader', groupId: group.slug }).select('email name').lean(),
    ])
    res.json({
      id: group.slug,
      name: group.name,
      members: group.members,
      motto: group.motto,
      accountEmail: account?.email || '',
      accountName: account?.name || '',
      works: works.map((doc) => toPublicManga(doc, { withChapters: true })),
    })
  } catch (err) {
    next(err)
  }
}

export async function recordRead(req, res, next) {
  try {
    const readerKey = readerKeyFrom(req)
    if (!readerKey) {
      res.status(400).json({ error: 'Thiếu mã người đọc' })
      return
    }
    const slug = req.params.id
    const chapterId = Number(req.params.chapter)
    if (!Number.isInteger(chapterId) || chapterId < 1) {
      res.status(400).json({ error: 'Chương không hợp lệ' })
      return
    }
    const manga = await Manga.findOne({ slug }).select('slug chapters.id').lean()
    if (!manga) {
      res.status(404).json({ error: 'Không tìm thấy truyện' })
      return
    }
    if (!(manga.chapters || []).some((chapter) => chapter.id === chapterId)) {
      res.status(404).json({ error: 'Không tìm thấy chương' })
      return
    }
    const chapterAdded = await noteOnce({ mangaSlug: slug, chapterId, readerKey, kind: 'read' })
    const seriesAdded = await noteOnce({ mangaSlug: slug, chapterId: 0, readerKey, kind: 'read' })
    const inc = {}
    if (seriesAdded) inc.views = 1
    if (chapterAdded) inc['chapters.$.views'] = 1
    if (Object.keys(inc).length) {
      await Manga.updateOne({ slug, 'chapters.id': chapterId }, { $inc: inc })
    }
    const fresh = await Manga.findOne({ slug }).select('views likes follows chapters.id chapters.views').lean()
    const freshChapter = (fresh?.chapters || []).find((chapter) => chapter.id === chapterId)
    res.json({
      views: fresh?.views || 0,
      likes: fresh?.likes || 0,
      follows: fresh?.follows || 0,
      chapterId,
      chapterViews: freshChapter?.views || 0,
    })
  } catch (err) {
    next(err)
  }
}

export async function setReaction(req, res, next) {
  try {
    const readerKey = readerKeyFrom(req)
    if (!readerKey) {
      res.status(400).json({ error: 'Thiếu mã người đọc' })
      return
    }
    const kind = req.body?.kind
    if (kind !== 'follow' && kind !== 'like') {
      res.status(400).json({ error: 'Loại không hợp lệ' })
      return
    }
    const slug = req.params.id
    const exists = await Manga.exists({ slug })
    if (!exists) {
      res.status(404).json({ error: 'Không tìm thấy truyện' })
      return
    }
    const field = kind === 'follow' ? 'follows' : 'likes'
    const on = Boolean(req.body?.on)
    if (on) {
      const added = await noteOnce({ mangaSlug: slug, chapterId: 0, readerKey, kind })
      if (added) await Manga.updateOne({ slug }, { $inc: { [field]: 1 } })
    } else {
      const removed = await Read.deleteOne({ mangaSlug: slug, chapterId: 0, readerKey, kind })
      if (removed.deletedCount) {
        await Manga.updateOne({ slug, [field]: { $gt: 0 } }, { $inc: { [field]: -1 } })
      }
    }
    const fresh = await Manga.findOne({ slug }).select('views likes follows').lean()
    res.json({ views: fresh?.views || 0, likes: fresh?.likes || 0, follows: fresh?.follows || 0, on })
  } catch (err) {
    next(err)
  }
}

function mangaSlugFrom(title) {
  const base = fold(title).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'truyen'
  return `${base}-${Date.now().toString().slice(-6)}`
}

export async function listMyMangas(req, res, next) {
  try {
    const docs = await Manga.find({ ownerId: req.userId }).select('-chapters.lines -chapters.paragraphs').sort({ createdAt: -1 }).lean()
    res.json(docs.map((doc) => toPublicManga(doc, { withChapters: true })))
  } catch (err) {
    next(err)
  }
}

export async function createManga(req, res, next) {
  try {
    const user = req.user
    const title = String(req.body?.title || '').trim()
    const description = String(req.body?.description || '').trim()
    const alt = String(req.body?.alt || '').trim()
    const authorName = String(req.body?.authorName || user.name).trim() || user.name
    const translator = String(req.body?.translator || user.name).trim() || user.name
    const coverUrl = cleanAssetUrls([req.body?.coverUrl])[0] || ''
    const kind = req.body?.kind === 'Tiểu thuyết' ? 'Tiểu thuyết' : 'Manga'
    const status = ['Đang ra', 'Hoàn thành', 'Tạm dừng'].includes(req.body?.status) ? req.body.status : 'Đang ra'
    const asDraft = req.body?.draft === true
    const genres = Array.isArray(req.body?.genres)
      ? req.body.genres.map((item) => String(item).trim()).filter(Boolean)
      : []
    if (title.length < 2) {
      res.status(400).json({ error: 'Tên truyện cần ít nhất 2 ký tự.' })
      return
    }
    if (description.length < 8) {
      res.status(400).json({ error: 'Mô tả cần ít nhất 8 ký tự.' })
      return
    }

    if (user.role !== 'uploader' && user.role !== 'admin') {
      user.role = 'uploader'
      if (!user.groupId) user.groupId = 'doc-lap'
      await user.save()
    }

    const groupId = user.groupId || 'doc-lap'
    let group = await Group.findOne({ slug: groupId })
    if (!group) {
      group = await Group.create({
        slug: groupId,
        name: groupId === 'doc-lap' ? 'Độc lập' : user.name,
        members: 1,
        motto: 'Đăng từ tài khoản MOCHI.',
      })
    }

    const authorSlug = `user-${String(user._id).slice(-8)}`
    await Author.findOneAndUpdate(
      { slug: authorSlug },
      { slug: authorSlug, name: authorName },
      { upsert: true },
    )

    const images = cleanAssetUrls(req.body?.images)
    const paragraphs = Array.isArray(req.body?.paragraphs)
      ? req.body.paragraphs.map((item) => String(item).trim()).filter(Boolean)
      : String(req.body?.chapterText || '').split(/\n{2,}/).map((item) => item.trim()).filter(Boolean)
    const chapterTitle = String(req.body?.chapterTitle || '').trim() || (images.length || paragraphs.length ? 'Chương 1' : '')
    const chapters = (images.length || paragraphs.length || chapterTitle)
      ? [{
        id: 1,
        title: chapterTitle || 'Chương 1',
        time: 'Vừa xong',
        likes: 0,
        views: 0,
        lines: [],
        paragraphs,
        images,
      }]
      : []

    const slug = mangaSlugFrom(title)
    const manga = await Manga.create({
      slug,
      title,
      alt: alt || 'Bản gốc chưa đặt',
      authorId: authorSlug,
      authorName,
      groupId: group.slug,
      groupName: group.name,
      translator,
      genres,
      views: 0,
      likes: 0,
      follows: 0,
      status,
      updated: 'Vừa xong',
      hue: Math.floor(Math.random() * 360),
      badge: asDraft ? 'NHÁP' : 'CHỜ DUYỆT',
      kind,
      chapterCount: chapters.length,
      lead: user.name,
      partner: 'Người ấy',
      blurb: description.slice(0, 140),
      description,
      lineA: description.slice(0, 80),
      lineB: 'Cảm ơn vì đã mở ra đọc.',
      coverUrl,
      ownerId: user._id,
      moderation: asDraft ? 'draft' : 'pending',
      reviewNote: '',
      chapters,
    })

    res.status(201).json({ manga: toPublicManga(manga, { withChapters: true }), user: user.toPublic() })
  } catch (err) {
    if (err?.code === 11000) {
      res.status(409).json({ error: 'Tên truyện vừa trùng. Hãy đổi tên rồi đăng lại.' })
      return
    }
    next(err)
  }
}

async function ownedManga(req, res) {
  const manga = await Manga.findOne({ slug: req.params.id })
  if (!manga) {
    res.status(404).json({ error: 'Không tìm thấy truyện' })
    return null
  }
  if (req.user.role !== 'admin' && !owns(req.user, manga)) {
    res.status(403).json({ error: 'Bạn không được sửa truyện này.' })
    return null
  }
  return manga
}

function markNeedsReview(manga) {
  if (manga.moderation === 'approved' || manga.moderation === 'rejected') {
    manga.moderation = 'pending'
    manga.badge = 'CHỜ DUYỆT'
    manga.reviewNote = ''
  }
  if (manga.moderation === 'draft') manga.badge = 'NHÁP'
  manga.updated = 'Vừa xong'
}

export async function updateManga(req, res, next) {
  try {
    const manga = await ownedManga(req, res)
    if (!manga) return
    const title = String(req.body?.title ?? manga.title).trim()
    const description = String(req.body?.description ?? manga.description).trim()
    if (title.length < 2) {
      res.status(400).json({ error: 'Tên truyện cần ít nhất 2 ký tự.' })
      return
    }
    manga.title = title
    manga.alt = String(req.body?.alt ?? manga.alt).trim()
    manga.description = description
    manga.blurb = description.slice(0, 140)
    manga.authorName = String(req.body?.authorName ?? manga.authorName).trim() || manga.authorName
    manga.translator = String(req.body?.translator ?? manga.translator).trim() || manga.translator
    if (Array.isArray(req.body?.genres)) manga.genres = req.body.genres.map((item) => String(item).trim()).filter(Boolean)
    if (req.body?.kind) manga.kind = req.body.kind === 'Tiểu thuyết' ? 'Tiểu thuyết' : 'Manga'
    if (['Đang ra', 'Hoàn thành', 'Tạm dừng'].includes(req.body?.status)) manga.status = req.body.status
    if (req.body?.coverUrl !== undefined) manga.coverUrl = cleanAssetUrls([req.body.coverUrl])[0] || ''
    if (req.user.role !== 'admin') {
      if (req.body?.submit === true && (manga.moderation === 'draft' || manga.moderation === 'rejected')) {
        manga.moderation = 'pending'
        manga.badge = 'CHỜ DUYỆT'
        manga.reviewNote = ''
      } else {
        markNeedsReview(manga)
      }
    }
    await manga.save()
    res.json({ manga: toPublicManga(manga, { withChapters: true }), user: req.user.toPublic() })
  } catch (err) {
    next(err)
  }
}

export async function deleteManga(req, res, next) {
  try {
    const manga = await ownedManga(req, res)
    if (!manga) return
    await Read.deleteMany({ mangaSlug: manga.slug })
    await manga.deleteOne()
    res.json({ ok: true, id: manga.slug })
  } catch (err) {
    next(err)
  }
}

export async function addChapter(req, res, next) {
  try {
    const manga = await ownedManga(req, res)
    if (!manga) return
    const images = cleanAssetUrls(req.body?.images)
    const paragraphs = Array.isArray(req.body?.paragraphs)
      ? req.body.paragraphs.map((item) => String(item).trim()).filter(Boolean)
      : String(req.body?.chapterText || '').split(/\n{2,}/).map((item) => item.trim()).filter(Boolean)
    const title = String(req.body?.title || '').trim()
    if (!title) {
      res.status(400).json({ error: 'Cần tên chương.' })
      return
    }
    if (!images.length && !paragraphs.length) {
      res.status(400).json({ error: 'Cần ảnh trang hoặc nội dung chữ.' })
      return
    }
    const nextId = (manga.chapters || []).reduce((max, chapter) => Math.max(max, Number(chapter.id) || 0), 0) + 1
    manga.chapters.push({
      id: nextId,
      title,
      time: 'Vừa xong',
      likes: 0,
      views: 0,
      lines: [],
      paragraphs,
      images,
    })
    manga.chapterCount = manga.chapters.length
    if (req.user.role !== 'admin') markNeedsReview(manga)
    else manga.updated = 'Vừa xong'
    await manga.save()
    res.status(201).json({ manga: toPublicManga(manga, { withChapters: true }) })
  } catch (err) {
    next(err)
  }
}

export async function listReviewQueue(req, res, next) {
  try {
    const status = ['pending', 'rejected', 'draft', 'approved'].includes(req.query.status) ? req.query.status : 'pending'
    const docs = await Manga.find({ moderation: status }).sort({ updatedAt: -1 }).select('-chapters.lines -chapters.paragraphs').lean()
    res.json(docs.map((doc) => toPublicManga(doc, { withChapters: true })))
  } catch (err) {
    next(err)
  }
}

export async function reviewManga(req, res, next) {
  try {
    const manga = await Manga.findOne({ slug: req.params.id })
    if (!manga) {
      res.status(404).json({ error: 'Không tìm thấy truyện' })
      return
    }
    const action = req.body?.action
    const note = String(req.body?.note || '').trim()
    if (action === 'approve') {
      manga.moderation = 'approved'
      manga.badge = 'MỚI'
      manga.reviewNote = ''
      manga.updated = 'Vừa xong'
    } else if (action === 'reject') {
      manga.moderation = 'rejected'
      manga.badge = 'TỪ CHỐI'
      manga.reviewNote = note || 'Chưa đủ điều kiện lên kệ.'
    } else {
      res.status(400).json({ error: 'Chọn duyệt hoặc từ chối.' })
      return
    }
    await manga.save()
    res.json({ manga: toPublicManga(manga, { withChapters: true }) })
  } catch (err) {
    next(err)
  }
}
