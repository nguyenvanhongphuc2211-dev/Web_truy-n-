import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mangas, withChapters } from './data'

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

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = load()
    const { settings: savedSettings, ...rest } = saved
    return {
      ageOk: false,
      user: null,
      saved: [],
      history: [],
      seen: [],
      likes: [],
      followAuthors: [],
      followGroups: [],
      followTranslators: [],
      albums: [],
      uploads: [],
      comments: {},
      posts: [],
      replies: {},
      readNotes: [],
      collapsed: false,
      ...rest,
      settings: { ...defaultSettings, ...(savedSettings || {}) },
    }
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  function notify(message) {
    setToast(message)
    window.clearTimeout(notify._t)
    notify._t = window.setTimeout(() => setToast(null), 2200)
  }

  const api = useMemo(() => {
    const patch = (partial) => setState((s) => ({ ...s, ...partial }))

    return {
      ...state,
      toast,
      notify,
      acceptAge: () => patch({ ageOk: true }),
      toggleCollapsed: () => setState((s) => ({ ...s, collapsed: !s.collapsed })),
      login: (user) => {
        patch({ user })
        notify(`Xin chào, ${user.name}`)
      },
      logout: () => {
        patch({ user: null })
        notify('Đã đăng xuất')
      },
      toggleSave: (id) => {
        let has = false
        setState((s) => {
          has = s.saved.includes(id)
          return { ...s, saved: has ? s.saved.filter((x) => x !== id) : [id, ...s.saved] }
        })
        notify(has ? 'Đã bỏ lưu' : 'Đã lưu truyện')
      },
      toggleLike: (id) => {
        setState((s) => ({
          ...s,
          likes: s.likes.includes(id) ? s.likes.filter((x) => x !== id) : [id, ...s.likes],
        }))
      },
      toggleAuthor: (id) => {
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
      toggleTranslator: (name) => {
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
          return {
            ...s,
            history: [{ mangaId, chapterId, at: Date.now() }, ...s.history.filter((h) => h.mangaId !== mangaId)].slice(0, 40),
            seen: s.seen.includes(key) ? s.seen : [key, ...s.seen].slice(0, 400),
          }
        })
      },
      addComment: (mangaId, text) => {
        const item = {
          id: `${Date.now()}`,
          user: state.user?.name || 'Khách',
          text: text.trim(),
          at: 'Vừa xong',
        }
        if (!item.text) return
        setState((s) => ({
          ...s,
          comments: { ...s.comments, [mangaId]: [item, ...(s.comments[mangaId] || [])] },
        }))
        notify('Đã gửi bình luận')
      },
      addPost: (post) => {
        setState((s) => ({ ...s, posts: [post, ...s.posts] }))
        notify('Đã đăng bài')
      },
      addReply: (postId, text) => {
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
        setState((s) => ({ ...s, uploads: [manga, ...s.uploads.filter((m) => m.id !== manga.id)] }))
        notify('Đã đăng truyện trên máy bạn')
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
  }, [state, toast])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}

export function useCatalog() {
  const { uploads } = useStore()
  return useMemo(() => [...uploads.map((item) => withChapters(item)), ...mangas], [uploads])
}
