import { once } from 'events'
import { promisify } from 'util'

/**
 * @param {import('http').Server} server
 * @param {number} port
 */
export async function httpListen (server, port) {
  /** @type {() => Promise<void>} */
  const close = promisify(server.close.bind(server))
  await once(server.listen(port), 'listening')
  return close
}
