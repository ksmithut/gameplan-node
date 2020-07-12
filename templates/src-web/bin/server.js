'use strict'

const { configureApp } = require('../index')
const { once } = require('../lib/once')
const { getConfig } = require('../config')

const app = configureApp(getConfig(process.env))

app
  .start()
  .then(close => {
    const shutdown = once(() => {
      close()
        .then(() => process.exit())
        .catch(err => {
          console.error(err)
          process.exit(1)
        })
    })
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    process.on('SIGUSR2', shutdown)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
