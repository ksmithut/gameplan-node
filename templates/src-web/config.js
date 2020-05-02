'use strict'

/** @typedef {ReturnType<getConfig>} Config */

/**
 * @param {NodeJS.Process} process
 */
function getConfig (process) {
  const { PORT = '3000' } = process.env
  return {
    port: Number(PORT)
  }
}

exports.getConfig = getConfig
