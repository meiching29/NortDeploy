export function openHttp(url) {
  const clean = url.replace(/^https?:\/\//, '')
  const link = document.createElement('a')
  link.href = `http://${clean}`
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
