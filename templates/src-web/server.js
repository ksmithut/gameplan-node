import http from 'http'

/**
 * @param {object} params
 */
export function configureServer (params) {
  /** @type {import('http').RequestListener} */
  const app = (req, res) => {
    res.end(`${req.method} ${req.url}`)
  }
  const server = http.createServer(app)
  return server
}
