import mongoose from 'mongoose'

const genreSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
)

export const Genre = mongoose.model('Genre', genreSchema)
