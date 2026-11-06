import { Router } from 'express'
import {
  getAuthor,
  getChapter,
  getGroup,
  getManga,
  listAuthors,
  recordRead,
  setReaction,
  listGenres,
  listGroups,
  listMangas,
} from '../controllers/catalogController.js'

export const catalogRouter = Router()

catalogRouter.get('/mangas', listMangas)
catalogRouter.get('/mangas/:id', getManga)
catalogRouter.get('/mangas/:id/chapters/:chapter', getChapter)
catalogRouter.post('/mangas/:id/chapters/:chapter/read', recordRead)
catalogRouter.post('/mangas/:id/react', setReaction)
catalogRouter.get('/genres', listGenres)
catalogRouter.get('/authors', listAuthors)
catalogRouter.get('/authors/:id', getAuthor)
catalogRouter.get('/groups', listGroups)
catalogRouter.get('/groups/:id', getGroup)
