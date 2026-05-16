// Rate limiting simple en memoria por usuario
// Límite: 10 requests por minuto por usuario
const requests = new Map()

const WINDOW_MS = 60 * 1000  // 1 minuto
const MAX_REQUESTS = 10

module.exports = function rateLimit(req, res, next) {
  const userId = req.user?._id || req.ip
  const now = Date.now()

  if (!requests.has(userId)) {
    requests.set(userId, [])
  }

  // Limpiar requests fuera de la ventana
  const userRequests = requests.get(userId).filter(t => now - t < WINDOW_MS)
  userRequests.push(now)
  requests.set(userId, userRequests)

  if (userRequests.length > MAX_REQUESTS) {
    return res.status(429).json({
      message: 'Demasiadas peticiones. Espera un momento antes de intentar de nuevo.'
    })
  }

  next()
}