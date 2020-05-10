'use strict'

/**
 * @template TReturnValue
 * @param {() => TReturnValue} fn
 */
function once (fn) {
  let called = false
  /** @type {TReturnValue} */
  let value
  return () => {
    if (!called) {
      value = fn()
      called = true
    }
    return value
  }
}

exports.once = once
