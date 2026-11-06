import mongoose from 'mongoose'

const readSchema = new mongoose.Schema(
  {
    mangaSlug: { type: String, required: true },
    chapterId: { type: Number, required: true },
    readerKey: { type: String, required: true },
    kind: { type: String, required: true, enum: ['read', 'follow', 'like'] },
  },
  { timestamps: true },
)

readSchema.index({ mangaSlug: 1, chapterId: 1, readerKey: 1, kind: 1 }, { unique: true })

export const Read = mongoose.model('Read', readSchema)
