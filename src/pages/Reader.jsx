import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Eye, List, Settings, X } from 'lucide-react'
import Cover from '../components/Cover'
import Comments from '../components/Comments'
import ReaderSettings from '../components/ReaderSettings'
import { chapterViewCount, compact, pagesFor } from '../data'
import { useTitle } from '../hooks'
import { chunkParagraphs, novelPageSize, paperOf, readerSettings } from '../readerSettings'
import { useCatalog, useStore } from '../store'

function novelParagraphs(chapter) {
  if (chapter.paragraphs?.length) return chapter.paragraphs
  return (chapter.lines || []).map((line) => (line.who === 'narr' ? line.text : `“${line.text}”`))
}

function ChapterTools({ manga, chapter, prevChapter, nextChapter }) {
  const navigate = useNavigate()
  const [jump, setJump] = useState('')
  const [error, setError] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const views = chapterViewCount(manga, chapter)

  function go(event) {
    event.preventDefault()
    const found = manga.chapters.find((item) => item.id === Number(jump))
    if (!found) {
      setError('Không có chương này.')
      return
    }
    navigate(`/doc/${manga.id}/${found.id}`)
  }

  return (
    <div className="reader-tools">
      <form className="row" onSubmit={go}>
        <label className="lbl">Đi tới chương
          <input className="input" inputMode="numeric" aria-label="Đi tới chương" placeholder="Số chương" value={jump} onChange={(event) => { setJump(event.target.value); setError('') }} />
        </label>
        <button className="btn btn-pink" type="submit">Tới</button>
        <span className="views"><Eye size={14} /> {compact(views)} người đọc</span>
      </form>
      {error && <p className="muted">{error}</p>}
      <div className="novel-nav">
        {prevChapter ? (
          <Link className="btn btn-ghost" to={`/doc/${manga.id}/${prevChapter.id}`}>Trước</Link>
        ) : <span className="btn btn-ghost" style={{ opacity: 0.45 }}>Trước</span>}
        <button className="btn btn-line" type="button" onClick={() => setListOpen((value) => !value)}><List size={16} /> Danh sách chương</button>
        {nextChapter ? (
          <Link className="btn btn-pink" to={`/doc/${manga.id}/${nextChapter.id}`}>Sau</Link>
        ) : <span className="muted">Hết chương</span>}
      </div>
      {listOpen && (
        <div className="chap-list panel" style={{ padding: 8, marginTop: 8 }}>
          {manga.chapters.map((item) => (
            <Link key={item.id} to={`/doc/${manga.id}/${item.id}`} className={`chap ${item.id === chapter.id ? 'read' : ''}`}>
              <b>{item.title}</b>
              <span className="views">{compact(chapterViewCount(manga, item))}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function NovelChapter({ manga, chapter, prevChapter, nextChapter, store, open, setOpen, navigate }) {
  const settings = readerSettings(store.settings)
  const paper = paperOf(settings.bg)
  const paragraphs = novelParagraphs(chapter)
  const pages = settings.mode === 'page' ? chunkParagraphs(paragraphs, novelPageSize(settings.fontSize)) : [paragraphs]
  const [page, setPage] = useState(0)
  const shown = pages[Math.min(page, pages.length - 1)] || []

  useEffect(() => {
    setPage(0)
  }, [chapter.id, settings.mode, settings.fontSize])

  function step(direction) {
    const next = page + direction
    if (next >= 0 && next < pages.length) {
      setPage(next)
      window.scrollTo(0, 0)
      return
    }
    if (direction > 0 && nextChapter) navigate(`/doc/${manga.id}/${nextChapter.id}`)
    if (direction < 0 && prevChapter) navigate(`/doc/${manga.id}/${prevChapter.id}`)
  }

  useEffect(() => {
    function onKey(event) {
      if (event.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
      if (event.key === 'Escape') navigate(`/truyen/${manga.id}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

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
        <button className="icon-btn" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} aria-label="Cài đặt đọc"><Settings size={18} /></button>
      </div>
      {open && (
        <div className="popover">
          <ReaderSettings settings={settings} onChange={store.updateSettings} linkToPage />
        </div>
      )}
      <article
        className={`novel-sheet ${paper.dark ? 'is-dark' : ''}`}
        style={{ maxWidth: settings.width, background: settings.bg, '--reader-font': `${settings.fontSize}px` }}
      >
        <p className="novel-kicker">{manga.title}</p>
        <h2>{chapter.title}</h2>
        <div className="novel-body">
          {shown.map((text, index) => <p key={`${page}-${index}`}>{text}</p>)}
        </div>
        {settings.mode === 'page' && (
          <div className="novel-nav" aria-label="Chuyển trang">
            <button className="btn btn-ghost" type="button" onClick={() => step(-1)} disabled={page === 0 && !prevChapter}>Trang trước</button>
            <span>{page + 1} / {pages.length}</span>
            <button className="btn btn-pink" type="button" onClick={() => step(1)} disabled={page >= pages.length - 1 && !nextChapter}>Trang sau</button>
          </div>
        )}
        <ChapterTools manga={manga} chapter={chapter} prevChapter={prevChapter} nextChapter={nextChapter} />
      </article>
      <div style={{ maxWidth: settings.width, margin: '0 auto 48px' }}>
        <Comments manga={manga} chapterId={chapter.id} />
      </div>
    </div>
  )
}

export default function Reader() {
  const { id, chapter: chapterParam } = useParams()
  const catalog = useCatalog()
  const store = useStore()
  const manga = catalog.find((item) => item.id === id)
  const chapterId = Number(chapterParam)
  const chapter = manga?.chapters?.find((item) => item.id === chapterId)
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [open, setOpen] = useState(false)
  const waitingForBody = manga?.kind === 'Tiểu thuyết' && chapter && !chapter.paragraphs?.length && !chapter.lines?.length && !chapter.images?.length
  const imagePages = chapter?.images?.length ? chapter.images : []
  const pages = manga && chapter ? (imagePages.length ? imagePages.map((url) => [{ who: 'img', text: url }]) : pagesFor(manga, chapter)) : []
  useTitle(manga && chapter ? `${manga.title} · Chương ${chapter.id}` : 'Đọc truyện')

  useEffect(() => {
    store.ensureManga(id)
  }, [id, store.ensureManga])

  useEffect(() => {
    if (id && chapterParam) store.loadChapter(id, chapterParam)
  }, [id, chapterParam, store.loadChapter])

  const nextChapter = manga?.chapters.find((item) => item.id === chapterId + 1)
  const prevChapter = manga?.chapters.find((item) => item.id === chapterId - 1)
  const settings = readerSettings(store.settings)
  const mode = settings.mode
  const novelReading = Boolean(manga && chapter && manga.kind === 'Tiểu thuyết' && !imagePages.length)

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
    window.scrollTo(0, 0)
    if (manga && chapter) store.pushHistory(manga.id, chapter.id)
  }, [manga?.id, chapter?.id])

  useEffect(() => {
    if (novelReading) return undefined
    function onKey(event) {
      if (event.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'Escape') navigate(`/truyen/${id}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!manga || !chapter) return <div className="empty">Không thấy chương này.</div>
  if (waitingForBody) return <div className="empty">Đang tải chương…</div>

  if (imagePages.length) {
    const shown = mode === 'page' ? imagePages.slice(page, page + 1) : imagePages
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
          <button className="icon-btn" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} aria-label="Cài đặt đọc"><Settings size={18} /></button>
        </div>
        {open && (
          <div className="popover">
            <ReaderSettings settings={settings} onChange={store.updateSettings} linkToPage />
          </div>
        )}
        <div className="stage" style={{ maxWidth: settings.width }}>
          {shown.map((url, index) => (
            <figure key={url} className="scan-page">
              <img src={url} alt={`Trang ${index + (mode === 'page' ? page : 0) + 1}`} />
            </figure>
          ))}
          <div className="endcap panel">
            {mode === 'page' && (
              <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
                <button className="btn btn-ghost" type="button" onClick={() => go(-1)} disabled={page === 0 && !prevChapter}>Trang trước</button>
                <span>{page + 1} / {imagePages.length}</span>
                <button className="btn btn-ghost" type="button" onClick={() => go(1)} disabled={page === imagePages.length - 1 && !nextChapter}>Trang sau</button>
              </div>
            )}
            <ChapterTools manga={manga} chapter={chapter} prevChapter={prevChapter} nextChapter={nextChapter} />
            <Comments manga={manga} chapterId={chapter.id} />
          </div>
        </div>
      </div>
    )
  }

  if (manga.kind === 'Tiểu thuyết') {
    return (
      <NovelChapter
        manga={manga}
        chapter={chapter}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        store={store}
        open={open}
        setOpen={setOpen}
        navigate={navigate}
      />
    )
  }

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
        <button className="icon-btn" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} aria-label="Cài đặt đọc"><Settings size={18} /></button>
      </div>
      {open && (
        <div className="popover">
          <ReaderSettings settings={settings} onChange={store.updateSettings} linkToPage />
        </div>
      )}
      <div className="stage" style={{ maxWidth: settings.width }}>
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
          <ChapterTools manga={manga} chapter={chapter} prevChapter={prevChapter} nextChapter={nextChapter} />
          <Comments manga={manga} chapterId={chapter.id} />
          <p className="meta">Phím ← → đổi trang hoặc chương. Esc để thoát.</p>
        </div>
      </div>
    </div>
  )
}
