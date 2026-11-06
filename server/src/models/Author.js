import mongoose from 'mongoose'

const authorSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
)

export const Author = mongoose.model('Author', authorSchema)
