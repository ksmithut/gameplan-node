'use strict'

/** @typedef {ReturnType<getConfig>} Config */

/**
 * @param {NodeJS.ProcessEnv} env
 */
function getConfig (env) {
  const { PORT = '3000' } = env
  return {
    port: Number(PORT)
  }
}

exports.getConfig = getConfig
