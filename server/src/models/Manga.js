import mongoose from 'mongoose'

const lineSchema = new mongoose.Schema(
  {
    who: String,
    text: String,
  },
  { _id: false },
)

const chapterSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    title: String,
    time: String,
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    lines: [lineSchema],
    paragraphs: [String],
  },
  { _id: false },
)

const mangaSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    alt: String,
    authorId: String,
    authorName: String,
    groupId: String,
    groupName: String,
    translator: String,
    genres: { type: [String], default: [], index: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    follows: { type: Number, default: 0 },
    status: { type: String, default: 'Đang ra' },
    updated: String,
    hue: Number,
    badge: String,
    kind: String,
    chapterCount: { type: Number, default: 1 },
    lead: String,
    partner: String,
    blurb: String,
    description: String,
    lineA: String,
    lineB: String,
    coverUrl: String,
    chapters: { type: [chapterSchema], default: [] },
  },
  { timestamps: true },
)

mangaSchema.index({ title: 'text', alt: 'text', blurb: 'text' })

export const Manga = mongoose.model('Manga', mangaSchema)
