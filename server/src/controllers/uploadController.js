import { imageUpload, publicFileUrl } from '../lib/files.js'

export function postImage(req, res, next) {
  imageUpload(req, res, (err) => {
    if (err) {
      err.status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 400 : 400)
      if (err.code === 'LIMIT_FILE_SIZE') err.message = 'Ảnh tối đa 8MB.'
      next(err)
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'Thiếu file ảnh.' })
      return
    }
    res.status(201).json({ url: publicFileUrl(req.file.filename) })
  })
}
