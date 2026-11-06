import { Router } from 'express'
import {
  addChapter,
  createManga,
  deleteManga,
  getAuthor,
  getChapter,
  getGroup,
  getManga,
  listAuthors,
  listMyMangas,
  listReviewQueue,
  recordRead,
  reviewManga,
  setReaction,
  listGenres,
  listGroups,
  listMangas,
  updateManga,
} from '../controllers/catalogController.js'
import { postImage } from '../controllers/uploadController.js'
import { requireAdmin, requireVerified } from '../middleware/auth.js'

export const catalogRouter = Router()

catalogRouter.get('/mangas', listMangas)
catalogRouter.get('/mangas/mine', requireVerified, listMyMangas)
catalogRouter.post('/mangas', requireVerified, createManga)
catalogRouter.patch('/mangas/:id', requireVerified, updateManga)
catalogRouter.delete('/mangas/:id', requireVerified, deleteManga)
catalogRouter.post('/mangas/:id/chapters', requireVerified, addChapter)
catalogRouter.get('/mangas/:id', getManga)
catalogRouter.get('/mangas/:id/chapters/:chapter', getChapter)
catalogRouter.post('/mangas/:id/chapters/:chapter/read', recordRead)
catalogRouter.post('/mangas/:id/react', setReaction)
catalogRouter.post('/uploads', requireVerified, postImage)
catalogRouter.get('/admin/mangas', requireAdmin, listReviewQueue)
catalogRouter.patch('/admin/mangas/:id', requireAdmin, reviewManga)
catalogRouter.get('/genres', listGenres)
catalogRouter.get('/authors', listAuthors)
catalogRouter.get('/authors/:id', getAuthor)
catalogRouter.get('/groups', listGroups)
catalogRouter.get('/groups/:id', getGroup)
