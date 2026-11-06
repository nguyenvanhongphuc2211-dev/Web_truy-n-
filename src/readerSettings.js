export const READER_WIDTHS = [640, 760, 920]

export const READER_FONTS = [
  { id: 16, label: 'Nhỏ' },
  { id: 18, label: 'Vừa' },
  { id: 20, label: 'Lớn' },
]

export const READER_BACKGROUNDS = [
  { id: '#0c0a10', label: 'Đêm', dark: true },
  { id: '#16141c', label: 'Than', dark: true },
  { id: '#efe6d6', label: 'Giấy', dark: false },
  { id: '#f7f7f5', label: 'Sáng', dark: false },
]

export const defaultReaderSettings = {
  mode: 'scroll',
  width: 760,
  bg: '#0c0a10',
  fontSize: 18,
}

export function readerSettings(raw) {
  const next = { ...defaultReaderSettings, ...(raw || {}) }
  if (next.mode !== 'page') next.mode = 'scroll'
  if (!READER_WIDTHS.includes(Number(next.width))) next.width = defaultReaderSettings.width
  else next.width = Number(next.width)
  if (!READER_FONTS.some((item) => item.id === Number(next.fontSize))) next.fontSize = defaultReaderSettings.fontSize
  else next.fontSize = Number(next.fontSize)
  if (!READER_BACKGROUNDS.some((item) => item.id === next.bg)) next.bg = defaultReaderSettings.bg
  return next
}

export function paperOf(bg) {
  return READER_BACKGROUNDS.find((item) => item.id === bg) || READER_BACKGROUNDS[0]
}

export function novelPageSize(fontSize) {
  if (fontSize >= 20) return 4
  if (fontSize <= 16) return 7
  return 5
}

export function chunkParagraphs(paragraphs, size) {
  const pages = []
  for (let index = 0; index < paragraphs.length; index += size) {
    pages.push(paragraphs.slice(index, index + size))
  }
  return pages.length ? pages : [[]]
}
