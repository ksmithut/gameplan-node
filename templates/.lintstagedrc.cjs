'use strict'

module.exports = {
  '*': 'prettier-standard --lint',
  '**/*': () => 'tsc'
}
