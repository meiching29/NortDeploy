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
    console.log(`[auth] verify-token response.data = ${JSON.stringify(response.data)}`)

    // Roble may wrap the user object; try common shapes
    const robleUser = response.data?.user ?? response.data?.data ?? response.data
    req.user = {
      _id: robleUser.sub,
      email: robleUser.email,
      role: robleUser.role,
    }
    req.accessToken = accessToken
    next()
  } catch (err) {
    console.error(`[auth] Token verification failed: ${err.response?.status} ${err.message}`)
    return res.status(401).json({ message: 'Token inválido o expirado.' })
  }
}