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
 * @param {number} period
 * @param {string} [errorMessage]
 * @param {string} [errorCode]
 */
function timeout (promise, period, errorMessage, errorCode) {
  /** @type {NodeJS.Timeout} */
  let timeoutId
  return Promise.race([
    promise,
    new Promise((resolve, reject) => {
      timeoutId = setTimeout(resolve, period)
    }).then(() => Promise.reject(new Timeout(errorMessage, errorCode)))
  ]).finally(() => clearTimeout(timeoutId))
}

exports.timeout = timeout
