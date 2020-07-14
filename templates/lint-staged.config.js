'use strict'

module.exports = {
  '*': 'prettier-standard --lint',
  '**/*.{js,json}': () => 'tsc'
}
