'use strict'

const { start } = require('../index')
const { getConfig } = require('../config')

start(getConfig(process))
  .then(close => {
    let closing = false
    function shutdown () {
      if (closing) return
      closing = true
      close()
        .then(() => process.exit())
        .catch(err => {
          console.error(err)
          process.exit(1)
        })
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    process.on('SIGUSR2', shutdown)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
