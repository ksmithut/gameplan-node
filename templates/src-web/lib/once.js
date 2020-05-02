'use strict'

/**
 * @template TReturnValue
 * @param {() => TReturnValue} fn
 * @returns {() => TReturnValue}
 */
function once (fn) {
  let called = false
  /** @type {TReturnValue} */
  let value
  return () => {
    if (!called) {
      called = true
      value = fn()
    }
    return value
  }
}

exports.once = once
