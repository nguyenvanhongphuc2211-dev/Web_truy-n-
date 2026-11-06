import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    members: { type: Number, default: 1 },
    motto: { type: String, default: '' },
  },
  { timestamps: true },
)

export const Group = mongoose.model('Group', groupSchema)
