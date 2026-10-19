import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Settings, X } from 'lucide-react'
import Cover from '../components/Cover'
import { pagesFor } from '../data'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'

const BACKGROUNDS = ['#0c0a10', '#16141c', '#efe6d6', '#f7f7f5']

export default function Reader() {
  const { id, chapter: chapterParam } = useParams()
  const catalog = useCatalog()
  const manga = catalog.find((item) => item.id === id)
  const chapterId = Number(chapterParam)
  const chapter = manga?.chapters.find((item) => item.id === chapterId)
  const store = useStore()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [open, setOpen] = useState(false)
  const pages = manga && chapter ? pagesFor(manga, chapter) : []
  useTitle(manga && chapter ? `${manga.title} · Chương ${chapter.id}` : 'Đọc truyện')

  const nextChapter = manga?.chapters.find((item) => item.id === chapterId + 1)
  const prevChapter = manga?.chapters.find((item) => item.id === chapterId - 1)
  const mode = store.settings.mode

  function go(step) {
    if (!manga || !chapter) return
    if (mode === 'page') {
      const target = page + step
      if (target >= 0 && target < pages.length) {
        setPage(target)
        return
      }
    }
    if (step > 0 && nextChapter) navigate(`/doc/${manga.id}/${nextChapter.id}`)
    if (step < 0 && prevChapter) navigate(`/doc/${manga.id}/${prevChapter.id}`)
  }

  useEffect(() => {
    setPage(0)
    if (manga && chapter) store.pushHistory(manga.id, chapter.id)
  }, [manga?.id, chapter?.id])

  useEffect(() => {
    function onKey(event) {
      if (event.target && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'Escape') navigate(`/truyen/${id}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!manga || !chapter) return <div className="empty">Không thấy chương này.</div>

  const shown = mode === 'page' ? pages.slice(page, page + 1) : pages

  return (
    <div>
      <div className="reader-top">
        <Link to={`/truyen/${manga.id}`} className="icon-btn" aria-label="Về trang truyện" style={{ textDecoration: 'none' }}><X size={18} /></Link>
        <div className="grow">
          <h1>{manga.title}</h1>
          <span className="meta">{chapter.title}</span>
        </div>
        <button className="btn btn-ghost" type="button" disabled={!prevChapter} onClick={() => prevChapter && navigate(`/doc/${manga.id}/${prevChapter.id}`)}>
          <ChevronLeft size={16} /> Chương trước
        </button>
        <button className="btn btn-ghost" type="button" disabled={!nextChapter} onClick={() => nextChapter && navigate(`/doc/${manga.id}/${nextChapter.id}`)}>
          Chương sau <ChevronRight size={16} />
        </button>
        <button className="icon-btn" type="button" onClick={() => setOpen((value) => !value)} aria-label="Cài đặt đọc"><Settings size={18} /></button>
      </div>
      {open && (
        <div className="popover">
          <p style={{ marginTop: 0 }}><b>Cách đọc</b></p>
          <div className="choice">
            <button className={`tab ${mode === 'scroll' ? 'on' : ''}`} type="button" onClick={() => store.updateSettings({ mode: 'scroll' })}>Cuộn dọc</button>
            <button className={`tab ${mode === 'page' ? 'on' : ''}`} type="button" onClick={() => store.updateSettings({ mode: 'page' })}>Từng trang</button>
          </div>
          <p><b>Độ rộng</b></p>
          <div className="choice">
            {[640, 760, 920].map((width) => (
              <button key={width} className={`tab ${store.settings.width === width ? 'on' : ''}`} type="button" onClick={() => store.updateSettings({ width })}>{width}</button>
            ))}
          </div>
          <p><b>Nền</b></p>
          <div className="choice">
            {BACKGROUNDS.map((color) => (
              <button key={color} className={`swatch ${store.settings.bg === color ? 'on' : ''}`} style={{ background: color }} type="button" aria-label={color} onClick={() => store.updateSettings({ bg: color })} />
            ))}
          </div>
          <Link to="/cai-dat">Mở trang cài đặt</Link>
        </div>
      )}
      <div className="stage" style={{ maxWidth: store.settings.width }}>
        {shown.map((lines, pageIndex) => (
          <article key={pageIndex} className="comic" style={{ background: store.settings.bg === '#efe6d6' ? '#fffaf2' : 'white' }}>
            <div className="art-frame">
              <Cover manga={{ ...manga, hue: (manga.hue + (mode === 'page' ? page : pageIndex) * 18) % 360, badge: null }} />
            </div>
            <div className="script">
              {lines.map((line, lineIndex) => line.who === 'narr' ? (
                <p key={lineIndex} className="narr">{line.text}</p>
              ) : (
                <div key={lineIndex} className="bubble">
                  <b>{line.who}</b>
                  {line.text}
                </div>
              ))}
              <p className="page-no">{manga.title} · {pageIndex + (mode === 'page' ? page : 0) + 1}/{pages.length}</p>
            </div>
          </article>
        ))}
        <div className="endcap panel">
          {mode === 'page' && (
            <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
              <button className="btn btn-ghost" type="button" onClick={() => go(-1)} disabled={page === 0 && !prevChapter}>Trang trước</button>
              <span>{page + 1} / {pages.length}</span>
              <button className="btn btn-ghost" type="button" onClick={() => go(1)} disabled={page === pages.length - 1 && !nextChapter}>Trang sau</button>
            </div>
          )}
          <p>Hết phần đang mở của chương {chapter.id}.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            {nextChapter ? <Link className="btn btn-pink" to={`/doc/${manga.id}/${nextChapter.id}`}>Sang chương {nextChapter.id}</Link> : <span className="muted">Bạn đang ở chương mới nhất.</span>}
            <Link className="btn btn-ghost" to={`/truyen/${manga.id}`}>Về danh sách chương</Link>
          </div>
          <p className="meta">Phím ← → đổi trang hoặc chương. Esc để thoát.</p>
        </div>
      </div>
    </div>
  )
}
