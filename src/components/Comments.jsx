import { useState } from 'react'
import { readerLevel } from '../data'
import { useStore } from '../store'

function CommentBody({ text }) {
  const parts = text.split(/(@[\p{L}\d_]+)/u)
  return parts.map((part, index) => (
    part.startsWith('@') ? <span key={index} className="mention">{part}</span> : <span key={index}>{part}</span>
  ))
}

function CommentItem({ mangaId, comment, chapters, replies, onReply }) {
  const store = useStore()
  const level = readerLevel(
    comment.user,
    store.comments,
    comment.user === (store.user?.name || 'Khách') ? store.history.length : 0,
  )
  const chapter = chapters.find((item) => item.id === comment.chapterId)
  return (
    <div className={`comment ${comment.reported ? 'reported' : ''}`}>
      <b>{comment.user}</b>
      <span className="level">{level}</span>
      <span className="meta">{comment.at}{chapter ? ` · ${chapter.title}` : ''}</span>
      <p style={{ margin: '6px 0 0' }}>{comment.reported ? 'Bình luận đã bị báo cáo.' : <CommentBody text={comment.text} />}</p>
      <div className="row" style={{ marginTop: 6 }}>
        <button className="btn btn-ghost" type="button" onClick={() => onReply(comment)}>Trả lời</button>
        <button className="btn btn-ghost" type="button" onClick={() => store.reportComment(mangaId, comment.id)}>
          {comment.reported ? 'Bỏ báo cáo' : 'Báo cáo'}
        </button>
      </div>
      {replies.map((reply) => (
        <div key={reply.id} className={`comment reply ${reply.reported ? 'reported' : ''}`}>
          <b>{reply.user}</b>
          <span className="level">{readerLevel(reply.user, store.comments, reply.user === (store.user?.name || 'Khách') ? store.history.length : 0)}</span>
          <span className="meta">{reply.at}</span>
          <p style={{ margin: '6px 0 0' }}>{reply.reported ? 'Bình luận đã bị báo cáo.' : <CommentBody text={reply.text} />}</p>
        </div>
      ))}
    </div>
  )
}

export default function Comments({ manga, chapterId = null }) {
  const store = useStore()
  const chapters = manga.chapters || []
  const [text, setText] = useState('')
  const [picked, setPicked] = useState(chapterId || '')
  const [parent, setParent] = useState(null)
  const all = store.comments[manga.id] || []
  const roots = all.filter((item) => !item.parentId && (!chapterId || item.chapterId === chapterId))

  function send(event) {
    event.preventDefault()
    if (!store.askLogin()) return
    store.addComment(manga.id, {
      text,
      chapterId: chapterId || picked || null,
      parentId: parent?.id || null,
    })
    setText('')
    setParent(null)
  }

  return (
    <div>
      <form className="comment-form" onSubmit={send}>
        <label className="lbl">
          Gắn với chương
          <select className="input" value={chapterId || picked} disabled={Boolean(chapterId)} onChange={(event) => setPicked(event.target.value)}>
            <option value="">Cả bộ</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
            ))}
          </select>
        </label>
        <label className="lbl">
          {parent ? `Trả lời ${parent.user}` : 'Bình luận'}
          <textarea
            className="input"
            aria-label="Bình luận"
            placeholder="Viết bình luận. Gõ @tên để nhắc người khác."
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <div className="row">
          <button className="btn btn-pink" type="submit">{parent ? 'Gửi trả lời' : 'Gửi'}</button>
          {parent && <button className="btn btn-ghost" type="button" onClick={() => setParent(null)}>Hủy trả lời</button>}
        </div>
      </form>
      {roots.map((comment) => (
        <CommentItem
          key={comment.id}
          mangaId={manga.id}
          comment={comment}
          chapters={chapters}
          replies={all.filter((item) => item.parentId === comment.id)}
          onReply={setParent}
        />
      ))}
      {!roots.length && <div className="empty">Chưa có bình luận.</div>}
    </div>
  )
}
