/** @typedef {ReturnType<getConfig>} Config */

/**
 * @param {NodeJS.ProcessEnv} env
 */
export function getConfig (env) {
  const { PORT = '3000' } = env
  return {
    name: 'test',
    port: Number(PORT),
    logLevel: 'info'
  }
}
