export function notFound(_req, res) {
  res.status(404).json({ error: 'Không tìm thấy' })
}

export function errorHandler(err, _req, res, _next) {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Lỗi máy chủ' })
}
