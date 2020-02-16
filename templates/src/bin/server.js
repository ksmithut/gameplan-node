'use strict'

const { start } = require('../index')

start(process)
  .then(close => {
    function shutdown () {
      close()
        .then(() => process.exit())
        .catch(err => {
          console.error(err)
          process.exit(1)
        })
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
