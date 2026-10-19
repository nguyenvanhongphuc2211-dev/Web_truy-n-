import { useEffect } from 'react'

export function useTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} — MOCHI`
      : 'MOCHI — Đọc truyện tranh Manga & Doujinshi'
  }, [title])
}
