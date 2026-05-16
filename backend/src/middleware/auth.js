const axios = require('axios')
const { ROBLE_AUTH, ROBLE_TOKEN } = require('../config/env')

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado.' })
  }

  const accessToken = authHeader.split(' ')[1]

  try {
    const response = await axios.get(
      `${ROBLE_AUTH}/${ROBLE_TOKEN}/verify-token`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    // Adjuntar info del usuario al request para usarla en los controllers
    req.user = response.data
    req.accessToken = accessToken
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado.' })
  }
}