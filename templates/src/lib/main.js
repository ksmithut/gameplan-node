'use strict'

/**
 * @param {(process: NodeJS.Process) => Promise<() => Promise<void>>} start
 * @returns {(process: NodeJS.Process) => Promise<void>}
 */
function main (start) {
  return async process => {
    const close = await start(process)
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
  }
}

exports.main = main
