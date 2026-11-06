import { useId } from 'react'

function hash(value) {
  return String(value).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function skipBlueYellow(hue) {
  const h = ((Number(hue) % 360) + 360) % 360
  if (h >= 40 && h <= 78) return 348
  if (h >= 175 && h <= 255) return 336
  return h
}

function titleLines(title) {
  const words = String(title || '').split(' ')
  const lines = ['']
  words.forEach((word) => {
    const last = lines[lines.length - 1]
    if (last && `${last} ${word}`.length > 16 && lines.length < 3) lines.push(word)
    else lines[lines.length - 1] = `${last} ${word}`.trim()
  })
  return lines.slice(0, 3)
}

export default function Cover({ manga, crop = false }) {
  const uid = useId().replace(/:/g, '')
  const n = hash(manga.id || manga.title)
  const hue = skipBlueYellow(manga.hue ?? n % 360)
  const hairHue = skipBlueYellow((hue + 320) % 360)
  const shirtHue = skipBlueYellow((hue + 40) % 360)
  const skin = ['#f6d2be', '#efc0a6', '#f3c7ae', '#e7b394'][n % 4]
  const hair = `hsl(${hairHue} 42% ${28 + (n % 12)}%)`
  const shirt = `hsl(${shirtHue} 48% 42%)`
  const accent = `hsl(${hue} 85% 62%)`
  const style = n % 4
  const glasses = n % 5 === 0
  const lines = titleLines(manga.title)

  if (manga.coverUrl) {
    return (
      <div className={`cover-art ${crop ? 'is-crop' : ''}`}>
        <img className="cover-svg" src={manga.coverUrl} alt="" />
        {!crop && manga.badge && <span className="ribbon">{manga.badge}</span>}
      </div>
    )
  }

  const hairPath =
    style === 1
      ? 'M78 200 C70 90 230 78 226 196 C236 250 214 300 188 318 C170 250 150 220 132 250 C108 300 86 260 78 200 Z'
      : style === 2
        ? 'M86 188 C78 96 224 90 218 186 C210 150 176 168 150 142 C124 168 98 148 86 188 Z'
        : 'M72 210 C62 86 240 70 234 206 C250 290 214 360 150 378 C86 360 54 290 72 210 Z'

  return (
    <div className={`cover-art ${crop ? 'is-crop' : ''}`}>
      <svg className="cover-svg" viewBox="0 0 300 430" aria-hidden="true">
        <defs>
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={`hsl(${hue} 55% 28%)`} />
            <stop offset="0.55" stopColor={`hsl(${skipBlueYellow((hue + 28) % 360)} 48% 16%)`} />
            <stop offset="1" stopColor="#120e16" />
          </linearGradient>
          <linearGradient id={`fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(0,0,0,0)" />
            <stop offset="1" stopColor="rgba(0,0,0,.78)" />
          </linearGradient>
        </defs>
        <rect width="300" height="430" fill={`url(#bg-${uid})`} />
        <circle cx="48" cy="54" r="34" fill="white" opacity="0.08" />
        <circle cx="250" cy="86" r="58" fill={accent} opacity="0.18" />
        <circle cx="210" cy="250" r="90" fill="white" opacity="0.04" />
        <path d="M20 0 H70 L20 430 H-30 Z" fill="white" opacity="0.05" transform="rotate(16 150 200)" />

        <ellipse cx="150" cy="392" rx="126" ry="78" fill={shirt} />
        <path d="M108 332 Q150 292 192 332 L206 390 Q150 362 94 390 Z" fill={skin} />
        <path d="M116 346 Q150 392 184 346" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" />

        <path d={hairPath} fill={hair} />
        <ellipse cx="150" cy="196" rx="60" ry="70" fill={skin} />
        <path
          d={
            style === 2
              ? 'M92 176 C112 118 196 112 214 178 C186 154 164 188 150 156 C134 188 112 154 92 176 Z'
              : 'M88 168 C104 108 206 102 220 176 C190 146 168 186 150 148 C130 188 108 146 88 168 Z'
          }
          fill={hair}
        />
        {style === 1 && <path d="M196 210 C230 250 236 330 214 390 C200 330 188 260 196 210 Z" fill={hair} />}

        <ellipse cx="126" cy="202" rx="11" ry="13" fill="#241820" />
        <ellipse cx="176" cy="202" rx="11" ry="13" fill="#241820" />
        <ellipse cx="126" cy="202" rx="5" ry="6" fill={accent} />
        <ellipse cx="176" cy="202" rx="5" ry="6" fill={accent} />
        <circle cx="129" cy="197" r="2.4" fill="white" />
        <circle cx="179" cy="197" r="2.4" fill="white" />
        <path d="M138 168 Q126 160 116 168" fill="none" stroke={hair} strokeWidth="4" strokeLinecap="round" />
        <path d="M186 168 Q174 158 164 168" fill="none" stroke={hair} strokeWidth="4" strokeLinecap="round" />
        <path d="M140 232 Q150 240 162 232" fill="none" stroke="#c56d78" strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="108" cy="222" rx="10" ry="6" fill="#ff8aa8" opacity="0.45" />
        <ellipse cx="194" cy="222" rx="10" ry="6" fill="#ff8aa8" opacity="0.45" />
        {glasses && (
          <g fill="none" stroke="#f4f1f6" strokeWidth="2.4">
            <circle cx="126" cy="202" r="16" />
            <circle cx="176" cy="202" r="16" />
            <path d="M142 202 H160" />
          </g>
        )}

        {!crop && <rect x="0" y="300" width="300" height="130" fill={`url(#fade-${uid})`} />}
        {!crop &&
          lines.map((line, index) => (
            <text
              key={line}
              x="18"
              y={348 + index * 26}
              fill="white"
              fontFamily="Be Vietnam Pro, sans-serif"
              fontSize="22"
              fontWeight="800"
            >
              {line}
            </text>
          ))}
      </svg>
      {!crop && manga.badge && <span className="ribbon">{manga.badge}</span>}
    </div>
  )
}
