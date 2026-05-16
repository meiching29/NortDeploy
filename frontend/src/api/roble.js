import axios from 'axios'

const ROBLE_TOKEN = import.meta.env.VITE_ROBLE_TOKEN || 'nortdeploy_3e0806f857'
const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/auth/${ROBLE_TOKEN}`

const roble = axios.create({ baseURL: BASE_URL })

export const authAPI = {
  login: (email, password) =>
    roble.post('/login', { email, password }),

  register: (email, password, name) =>
    roble.post('/signup', { email, password, name }),

  registerDirect: (email, password, name) =>
    roble.post('/signup-direct', { email, password, name }),

  verifyEmail: (email, code) =>
    roble.post('/verify-email', { email, code }),

  verifyToken: (accessToken) =>
    roble.get('/verify-token', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),

  refreshToken: (refreshToken) =>
    roble.post('/refresh-token', { refreshToken }),

  logout: (accessToken) =>
    roble.post('/logout', null, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),

  forgotPassword: (email) =>
    roble.post('/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    roble.post('/reset-password', { token, newPassword }),
}