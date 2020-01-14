'use strict'

const http = require('http')
const { httpListen } = require('./lib/http-listen')
const { main } = require('./lib/main')
const { timeout } = require('./lib/timeout')

const start = main(async process => {
  const { PORT = '3000' } = process.env
  const port = Number(PORT)
  const server = http.createServer((req, res) => {
    res.end('Hello World')
  })
  const closeServer = await httpListen(server, port)
  console.log(`Server listening on port ${port}`)

  return async () => {
    await timeout(closeServer(), 10000)
  }
})

exports.start = start

if (module === require.main) {
  start(process).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
