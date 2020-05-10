'use strict'

class Timeout extends Error {
  constructor (message = 'timeout', code = 'TIMEOUT_ERROR') {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.code = code
  }
}

exports.Timeout = Timeout

/**
 * @template TValue
 * @param {Promise<TValue>} promise
 * @param {number} ms
 * @param {object} [options]
 * @param {string} [options.errorMessage]
 * @param {string} [options.errorCode]
 */
function timeout (promise, ms, { errorMessage, errorCode } = {}) {
  /** @type {NodeJS.Timeout} */
  let timeoutId
  return Promise.race([
    promise,
    new Promise(resolve => {
      timeoutId = setTimeout(resolve, ms)
    }).then(() => Promise.reject(new Timeout(errorMessage, errorCode)))
  ]).finally(() => clearTimeout(timeoutId))
}

exports.timeout = timeout
