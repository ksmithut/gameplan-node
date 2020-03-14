'use strict'

/**
 * @param {NodeJS.ProcessEnv} env
 */
function getConfig (env) {
  const { PORT = '3000' } = process.env
  return {
    port: Number(PORT)
  }
}

exports.getConfig = getConfig
