import { configureApp } from '../index.js'
import { once } from '../lib/once.js'
import { getConfig } from '../config.js'

const app = configureApp(getConfig(process.env))

async function start () {
  const close = await app.start()
  const shutdown = once(() => {
    close()
      .then(() => process.exit())
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
  })
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('SIGUSR2', shutdown)
}

start().catch(err => {
  console.error(err)
  process.exit(1)
})
