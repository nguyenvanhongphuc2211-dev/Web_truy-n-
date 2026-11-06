import { Link } from 'react-router-dom'
import { READER_BACKGROUNDS, READER_FONTS, READER_WIDTHS, paperOf } from '../readerSettings'

export default function ReaderSettings({ settings, onChange, preview = false, linkToPage = false }) {
  const paper = paperOf(settings.bg)

  return (
    <div className="reader-settings">
      <div>
        <p className="lbl" id="reader-mode">Cách đọc</p>
        <div className="choice" role="group" aria-labelledby="reader-mode">
          <button className={`tab ${settings.mode === 'scroll' ? 'on' : ''}`} type="button" aria-pressed={settings.mode === 'scroll'} onClick={() => onChange({ mode: 'scroll' })}>Cuộn dọc</button>
          <button className={`tab ${settings.mode === 'page' ? 'on' : ''}`} type="button" aria-pressed={settings.mode === 'page'} onClick={() => onChange({ mode: 'page' })}>Từng trang</button>
        </div>
        <p className="muted setting-hint">
          {settings.mode === 'page'
            ? 'Chương được chia trang. Mũi tên chuyển trang, hết trang thì sang chương kế.'
            : 'Cả chương nằm trên một trang. Mũi tên chuyển chương.'}
        </p>
      </div>
      <div>
        <p className="lbl" id="reader-width">Độ rộng</p>
        <div className="choice" role="group" aria-labelledby="reader-width">
          {READER_WIDTHS.map((width) => (
            <button key={width} className={`tab ${settings.width === width ? 'on' : ''}`} type="button" aria-pressed={settings.width === width} onClick={() => onChange({ width })}>{width}px</button>
          ))}
        </div>
      </div>
      <div>
        <p className="lbl" id="reader-font">Cỡ chữ tiểu thuyết</p>
        <div className="choice" role="group" aria-labelledby="reader-font">
          {READER_FONTS.map((item) => (
            <button key={item.id} className={`tab ${settings.fontSize === item.id ? 'on' : ''}`} type="button" aria-pressed={settings.fontSize === item.id} onClick={() => onChange({ fontSize: item.id })}>{item.label}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="lbl" id="reader-bg">Màu nền tiểu thuyết</p>
        <div className="choice" role="group" aria-labelledby="reader-bg">
          {READER_BACKGROUNDS.map((item) => (
            <button key={item.id} className={`swatch-choice ${settings.bg === item.id ? 'on' : ''}`} type="button" aria-pressed={settings.bg === item.id} onClick={() => onChange({ bg: item.id })}>
              <span className="swatch" style={{ background: item.id }} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {preview && (
        <article className={`novel-sheet setting-preview ${paper.dark ? 'is-dark' : ''}`} style={{ background: paper.id, '--reader-font': `${settings.fontSize}px`, maxWidth: '100%' }}>
          <p className="novel-kicker">Xem trước</p>
          <div className="novel-body">
            <p>Gió đổi hướng trước khi chàng trai kịp hiểu mình đang đứng đâu. Chữ và nền này sẽ theo sang mọi chương.</p>
          </div>
        </article>
      )}
      {linkToPage && <Link to="/cai-dat">Mở trang cài đặt</Link>}
    </div>
  )
}
