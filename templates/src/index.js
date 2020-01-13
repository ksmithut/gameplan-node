'use strict'

const http = require('http')
const { httpListen } = require('./lib/http-listen')
const { timeout } = require('./lib/timeout')

/**
 * @param {NodeJS.Process} process
 */
async function start (process) {
  const { PORT = '3000' } = process.env
  const port = Number(PORT)
  const server = http.createServer((req, res) => {
    res.end('Hello World')
  })
  console.log(`Server listening on port ${port}`)

  const closeServer = await httpListen(server, port)
  return async () => {
    await timeout(closeServer(), 10000)
  }
}

/**
 * @param {NodeJS.Process} process
 */
async function main (process) {
  const close = await start(process)

  function gracefulShutdown () {
    close()
      .then(() => process.exit())
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
  }
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
}

if (module === require.main) {
  main(process).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
