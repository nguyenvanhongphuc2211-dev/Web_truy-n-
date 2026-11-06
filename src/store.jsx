import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api, getToken, setToken } from './api'
import { authorLabel, withChapters } from './data'

const KEY = 'mochi-store-v1'
const StoreContext = createContext(null)

const defaultSettings = { mode: 'scroll', width: 760, bg: '#0c0a10' }

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function enrichMangas(mangas, authors, groups) {
  const authorMap = new Map(authors.map((author) => [author.id, author]))
  const groupMap = new Map(groups.map((group) => [group.id, group]))
  return mangas.map((manga) => ({
    ...manga,
    authorName: authorLabel(manga.authorName || authorMap.get(manga.authorId)?.name),
    groupName: manga.groupName || groupMap.get(manga.groupId)?.name,
  }))
}

function chapterHasBody(chapter) {
  return Boolean(chapter?.lines?.length || chapter?.paragraphs?.length || chapter?.images?.length)
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = load()
    const { settings: savedSettings, catalog: _catalog, genres: _genres, authors: _authors, groups: _groups, user: _user, ageOk: _ageOk, saved: savedIds, follows: loadedFollows, ...rest } = saved
    const follows = [...(loadedFollows || [])]
    for (const id of savedIds || []) {
      if (!follows.includes(id)) follows.push(id)
    }
    return {
      user: null,
      history: [],
      seen: [],
      likes: [],
      followAuthors: [],
      followGroups: [],
      followTranslators: [],
      follows: [],
      ratings: {},
      chapterViews: {},
      albums: [],
      uploads: [],
      comments: {},
      posts: [],
      replies: {},
      readNotes: [],
      collapsed: false,
      ...rest,
      follows,
      settings: { ...defaultSettings, ...(savedSettings || {}) },
    }
  })
  const [toast, setToast] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [genres, setGenres] = useState([])
  const [authors, setAuthors] = useState([])
  const [groups, setGroups] = useState([])
  const [catalogStatus, setCatalogStatus] = useState(() =>
    window.location.pathname === '/tim-kiem' || window.location.pathname === '/danh-sach' ? 'idle' : 'loading',
  )
  const [catalogError, setCatalogError] = useState(null)
  const [authReady, setAuthReady] = useState(!getToken())
  const missingManga = useRef(new Set())

  useEffect(() => {
    const { user: _user, ageOk: _ageOk, ...rest } = state
    localStorage.setItem(KEY, JSON.stringify(rest))
  }, [state])

  useEffect(() => {
    let cancelled = false
    async function restore() {
      if (!getToken()) {
        setAuthReady(true)
        return
      }
      try {
        const user = await api.me()
        if (!cancelled) setState((s) => ({ ...s, user }))
      } catch {
        setToken(null)
        if (!cancelled) setState((s) => ({ ...s, user: null }))
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  const reloadCatalog = useCallback(async () => {
    setCatalogStatus('loading')
    setCatalogError(null)
    try {
      const [mangas, nextGenres, nextAuthors, nextGroups] = await Promise.all([
        api.mangas(),
        api.genres(),
        api.authors(),
        api.groups(),
      ])
      let list = enrichMangas(mangas, nextAuthors, nextGroups)
      if (getToken()) {
        try {
          const mine = enrichMangas(await api.myMangas(), nextAuthors, nextGroups)
          const extra = new Map(mine.map((item) => [item.id, item]))
          list = [
            ...mine.filter((item) => !list.some((row) => row.id === item.id)),
            ...list.map((item) => extra.get(item.id) || item),
          ]
        } catch {
          /* khách hoặc token hết hạn */
        }
      }
      setCatalog(list)
      setGenres(nextGenres)
      setAuthors(nextAuthors.map((author) => ({ ...author, name: authorLabel(author.name) })))
      setGroups(nextGroups)
      setCatalogStatus('ready')
    } catch (err) {
      setCatalogError(err.message || 'Không tải được dữ liệu')
      setCatalogStatus('error')
    }
  }, [])

  useEffect(() => {
    if (window.location.pathname === '/tim-kiem' || window.location.pathname === '/danh-sach') return
    reloadCatalog()
  }, [reloadCatalog])

  const loadChapter = useCallback(async (mangaId, chapterId) => {
    const n = Number(chapterId)
    let cached = false
    setCatalog((current) => {
      const manga = current.find((item) => item.id === mangaId)
      const chapter = manga?.chapters?.find((item) => item.id === n)
      cached = chapterHasBody(chapter)
      return current
    })
    if (cached) return
    try {
      const data = await api.chapter(mangaId, n)
      setCatalog((current) =>
        current.map((manga) => {
          if (manga.id !== mangaId) return manga
          return {
            ...manga,
            chapters: (manga.chapters || []).map((chapter) => (
              chapter.id === n
                ? { ...chapter, ...data.chapter, views: Math.max(Number(chapter.views) || 0, Number(data.chapter?.views) || 0) }
                : chapter
            )),
          }
        }),
      )
    } catch {
      /* truyện chỉ có trên máy, hoặc API lỗi — Reader dùng bản mẫu */
    }
  }, [])

  const applyCounts = useCallback((mangaId, patch) => {
    if (!patch) return
    setCatalog((list) => list.map((manga) => {
      if (manga.id !== mangaId) return manga
      const chapters = patch.chapterId == null
        ? manga.chapters
        : (manga.chapters || []).map((chapter) => (
          chapter.id === patch.chapterId ? { ...chapter, views: patch.chapterViews ?? chapter.views ?? 0 } : chapter
        ))
      return {
        ...manga,
        views: patch.views ?? manga.views,
        follows: patch.follows ?? manga.follows,
        likes: patch.likes ?? manga.likes,
        chapters,
      }
    }))
  }, [])

  const reactionsSynced = useRef(false)
  useEffect(() => {
    if (catalogStatus !== 'ready' || reactionsSynced.current) return
    reactionsSynced.current = true
    const saved = load()
    for (const id of saved.follows || []) {
      api.react(id, { kind: 'follow', on: true }).then((result) => applyCounts(id, result)).catch(() => {})
    }
    for (const id of saved.likes || []) {
      api.react(id, { kind: 'like', on: true }).then((result) => applyCounts(id, result)).catch(() => {})
    }
  }, [catalogStatus, applyCounts])

  function notify(message, ms = 2200) {
    setToast(message)
    window.clearTimeout(notify._t)
    if (message == null || ms === 0) return
    notify._t = window.setTimeout(() => setToast(null), ms)
  }

  const store = useMemo(() => {
    const patch = (partial) => setState((s) => ({ ...s, ...partial }))
    const askLogin = () => {
      if (state.user) return true
      notify('login', 5000)
      return false
    }

    return {
      ...state,
      catalog,
      genres,
      authors,
      groups,
      catalogStatus,
      catalogError,
      authReady,
      reloadCatalog,
      ensureManga: async (id) => {
        if (!id || missingManga.current.has(id)) return
        let found = false
        setCatalog((current) => {
          found = current.some((item) => item.id === id)
          return current
        })
        if (found) return
        try {
          const manga = await api.manga(id)
          missingManga.current.delete(id)
          setCatalog((current) => (current.some((item) => item.id === manga.id) ? current : [manga, ...current]))
        } catch {
          missingManga.current.add(id)
        }
      },
      loadChapter,
      toast,
      notify,
      clearToast: () => notify(null),
      askLogin,
      toggleCollapsed: () => setState((s) => ({ ...s, collapsed: !s.collapsed })),
      setSession: (user, token) => {
        setToken(token)
        patch({ user })
        notify(`Xin chào, ${user.name}`)
      },
      setUser: (user) => patch({ user }),
      logout: () => {
        setToken(null)
        patch({ user: null })
        notify('Đã đăng xuất')
      },
      toggleLike: (id) => {
        const on = !state.likes.includes(id)
        setState((s) => ({
          ...s,
          likes: on ? [id, ...s.likes] : s.likes.filter((x) => x !== id),
        }))
        api.react(id, { kind: 'like', on }).then((result) => applyCounts(id, result)).catch(() => {})
      },
      toggleAuthor: (id) => {
        if (!askLogin()) return
        let has = false
        setState((s) => {
          has = s.followAuthors.includes(id)
          return {
            ...s,
            followAuthors: has ? s.followAuthors.filter((x) => x !== id) : [id, ...s.followAuthors],
          }
        })
        notify(has ? 'Đã bỏ theo dõi tác giả' : 'Đã theo dõi tác giả')
      },
      toggleGroup: (id) => {
        if (!askLogin()) return
        let has = false
        setState((s) => {
          has = s.followGroups.includes(id)
          return {
            ...s,
            followGroups: has ? s.followGroups.filter((x) => x !== id) : [id, ...s.followGroups],
          }
        })
        notify(has ? 'Đã bỏ theo dõi nhóm' : 'Đã theo dõi nhóm dịch')
      },
      toggleFollow: (id) => {
        if (!askLogin()) return
        const has = (state.follows || []).includes(id)
        setState((s) => ({
          ...s,
          follows: has ? (s.follows || []).filter((item) => item !== id) : [id, ...(s.follows || [])],
        }))
        notify(has ? 'Đã bỏ theo dõi truyện' : 'Đã theo dõi. Chương mới sẽ vào Thông báo.')
        api.react(id, { kind: 'follow', on: !has }).then((result) => applyCounts(id, result)).catch(() => {})
      },
      rateManga: (id, score) => {
        setState((s) => ({ ...s, ratings: { ...(s.ratings || {}), [id]: score } }))
      },
      toggleTranslator: (name) => {
        if (!askLogin()) return
        let has = false
        setState((s) => {
          has = s.followTranslators.includes(name)
          return {
            ...s,
            followTranslators: has
              ? s.followTranslators.filter((x) => x !== name)
              : [name, ...s.followTranslators],
          }
        })
        notify(has ? 'Đã bỏ theo dõi dịch giả' : 'Đã theo dõi dịch giả')
      },
      pushHistory: (mangaId, chapterId) => {
        const key = `${mangaId}:${chapterId}`
        setState((s) => {
          if (s.history[0]?.mangaId === mangaId && s.history[0]?.chapterId === chapterId && Date.now() - s.history[0].at < 1500) {
            return s
          }
          const noteId = `new-${mangaId}-${chapterId}`
          return {
            ...s,
            history: [{ mangaId, chapterId, at: Date.now() }, ...s.history.filter((h) => h.mangaId !== mangaId)].slice(0, 40),
            seen: s.seen.includes(key) ? s.seen : [key, ...s.seen].slice(0, 400),
            readNotes: s.readNotes.includes(noteId) ? s.readNotes : [...s.readNotes, noteId],
          }
        })
        api.recordRead(mangaId, chapterId).then((result) => applyCounts(mangaId, result)).catch(() => {})
      },
      addComment: (mangaId, payload) => {
        if (!askLogin()) return
        const fields = typeof payload === 'string' ? { text: payload } : payload
        const text = fields.text?.trim()
        if (!text) return
        const item = {
          id: `${Date.now()}`,
          user: state.user?.name || 'Khách',
          text,
          at: 'Vừa xong',
          chapterId: fields.chapterId ? Number(fields.chapterId) : null,
          parentId: fields.parentId || null,
          reported: false,
        }
        setState((s) => ({
          ...s,
          comments: { ...s.comments, [mangaId]: [item, ...(s.comments[mangaId] || [])] },
        }))
        notify('Đã gửi bình luận')
      },
      reportComment: (mangaId, commentId) => {
        setState((s) => ({
          ...s,
          comments: {
            ...s.comments,
            [mangaId]: (s.comments[mangaId] || []).map((item) => (
              item.id === commentId ? { ...item, reported: !item.reported } : item
            )),
          },
        }))
        notify('Đã ghi nhận báo cáo')
      },
      addPost: (post) => {
        if (!askLogin()) return
        setState((s) => ({ ...s, posts: [post, ...s.posts] }))
        notify('Đã đăng bài')
      },
      addReply: (postId, text) => {
        if (!askLogin()) return
        const item = {
          id: `${Date.now()}`,
          user: state.user?.name || 'Khách',
          text: text.trim(),
          at: 'Vừa xong',
        }
        if (!item.text) return
        setState((s) => ({
          ...s,
          replies: { ...s.replies, [postId]: [...(s.replies[postId] || []), item] },
        }))
      },
      addAlbum: (album) => {
        setState((s) => ({ ...s, albums: [album, ...s.albums] }))
        notify('Đã tạo album')
      },
      addToAlbum: (albumId, mangaId) => {
        setState((s) => ({
          ...s,
          albums: s.albums.map((album) => {
            if (album.id !== albumId) return album
            const has = album.mangaIds.includes(mangaId)
            return {
              ...album,
              mangaIds: has ? album.mangaIds.filter((id) => id !== mangaId) : [...album.mangaIds, mangaId],
            }
          }),
        }))
        notify('Đã cập nhật album')
      },
      uploadManga: (manga) => {
        if (!askLogin()) return
        setState((s) => ({ ...s, uploads: [manga, ...s.uploads.filter((m) => m.id !== manga.id)] }))
        notify('Đã đăng truyện trên máy bạn')
      },
      saveMangaEdit: (manga) => {
        setState((s) => ({ ...s, uploads: [manga, ...s.uploads.filter((m) => m.id !== manga.id)] }))
        notify('Đã lưu thông tin trên máy này')
      },
      updateSettings: (partial) => {
        setState((s) => ({ ...s, settings: { ...s.settings, ...partial } }))
      },
      markNotice: (id) => {
        setState((s) => ({ ...s, readNotes: s.readNotes.includes(id) ? s.readNotes : [...s.readNotes, id] }))
      },
      markAllNotices: (ids) => {
        setState((s) => ({ ...s, readNotes: Array.from(new Set([...s.readNotes, ...ids])) }))
      },
    }
  }, [state, toast, catalog, genres, authors, groups, catalogStatus, catalogError, authReady, reloadCatalog, loadChapter, applyCounts])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}

export function useCatalog() {
  const { catalog, uploads } = useStore()
  return useMemo(() => {
    const edits = new Map(uploads.map((item) => [item.id, item]))
    const baseIds = new Set(catalog.map((item) => item.id))
    const merged = catalog.map((item) => {
      const edit = edits.get(item.id)
      return edit ? withChapters({ ...item, ...edit }) : item
    })
    const added = uploads.filter((item) => !baseIds.has(item.id)).map((item) => withChapters(item))
    return [...added, ...merged]
  }, [uploads, catalog])
}
