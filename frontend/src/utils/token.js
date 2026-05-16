export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('nd_access', accessToken)
  localStorage.setItem('nd_refresh', refreshToken)
}

export const getAccessToken = () => localStorage.getItem('nd_access')
export const getRefreshToken = () => localStorage.getItem('nd_refresh')

export const clearTokens = () => {
  localStorage.removeItem('nd_access')
  localStorage.removeItem('nd_refresh')
}