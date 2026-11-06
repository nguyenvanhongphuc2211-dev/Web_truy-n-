import { connectDb } from '../config/db.js'
import { Author } from '../models/Author.js'
import { Genre } from '../models/Genre.js'
import { Group } from '../models/Group.js'
import { Manga } from '../models/Manga.js'
import { authors, genres, groups, mangas } from '../../../src/data.js'

function toMangaDoc(manga) {
  return {
    slug: manga.id,
    title: manga.title,
    alt: manga.alt,
    authorId: manga.authorId,
    authorName: manga.authorName,
    groupId: manga.groupId,
    groupName: manga.groupName,
    translator: manga.translator,
    genres: manga.genres || [],
    views: 0,
    likes: 0,
    follows: 0,
    status: manga.status,
    updated: manga.updated,
    hue: manga.hue,
    badge: manga.badge,
    kind: manga.kind,
    chapterCount: manga.chapterCount || manga.chapters?.length || 1,
    lead: manga.lead,
    partner: manga.partner,
    blurb: manga.blurb,
    description: manga.description,
    lineA: manga.lineA,
    lineB: manga.lineB,
    coverUrl: manga.coverUrl,
    chapters: (manga.chapters || []).map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      time: chapter.time,
      likes: 0,
      views: 0,
      lines: chapter.lines || [],
      paragraphs: chapter.paragraphs || [],
    })),
  }
}

try {
  const db = await connectDb()
  console.log(`Seed → ${db.name}`)

  await Promise.all([Genre.deleteMany({}), Author.deleteMany({}), Group.deleteMany({}), Manga.deleteMany({})])

  await Genre.insertMany(genres.map((genre) => ({ slug: genre.slug, name: genre.name })))
  await Author.insertMany(authors.map((author) => ({ slug: author.id, name: author.name })))
  await Group.insertMany(
    groups.map((group) => ({
      slug: group.id,
      name: group.name,
      members: group.members,
      motto: group.motto,
    })),
  )

  const docs = mangas.map(toMangaDoc)
  const chunk = 50
  for (let i = 0; i < docs.length; i += chunk) {
    await Manga.insertMany(docs.slice(i, i + chunk))
    console.log(`  manga ${Math.min(i + chunk, docs.length)}/${docs.length}`)
  }

  const [genreCount, authorCount, groupCount, mangaCount] = await Promise.all([
    Genre.countDocuments(),
    Author.countDocuments(),
    Group.countDocuments(),
    Manga.countDocuments(),
  ])
  console.log(`Xong: ${genreCount} thể loại, ${authorCount} tác giả, ${groupCount} nhóm, ${mangaCount} truyện.`)
  process.exit(0)
} catch (err) {
  console.error('Seed thất bại:', err)
  process.exit(1)
}
