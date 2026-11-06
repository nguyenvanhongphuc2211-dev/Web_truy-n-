import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    emailVerifyHash: { type: String, default: '' },
    emailVerifyExpires: { type: Date, default: null },
    emailVerifySentAt: { type: Date, default: null },
  },
  { timestamps: true },
)

userSchema.methods.isEmailVerified = function isEmailVerified() {
  if (this.emailVerified === true) return true
  if (this.emailVerifyHash) return false
  return true
}

userSchema.methods.toPublic = function toPublic() {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    emailVerified: this.isEmailVerified(),
  }
}

export const User = mongoose.model('User', userSchema)
