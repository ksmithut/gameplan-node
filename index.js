'use strict'

const path = require('path')

/**
 * @typedef {object} OptionDefinition
 * @property {string} type - Needs to be 'string' or 'boolean'
 * @property {string|boolean} default - The default value
 * @property {string} [description] - Used as description for cli prompts
 * @property {string} [prompt] - Used when prompting the user via cli
 * @property {string[]} [choices] - If you want to give multiple choices (enum)
 */

/**
 * @typedef {object.<string, OptionDefinition>} OptionDefinitions
 */

/**
 * @param {object} meta
 * @param {string} meta.directory - The absolute path to the directory the
 *   template will be run in
 * @return {OptionDefinitions}
 */
exports.options = ({ directory }) => ({
  name: {
    type: 'string',
    description: 'The name of the project',
    default: path.basename(meta.directory)
  },
  debug: {
    type: 'boolean',
    description: 'Enable vscode debugging',
    default: false
  },
  docker: {
    type: 'boolean',
    description: 'Add docker files to the project',
    default: false
  },
  git: {
    type: 'boolean',
    description: 'Initialize as a git repository',
    default: true
  },
  lint: {
    type: 'boolean',
    description: 'Add linting support',
    default: true
  },
  test: {
    type: 'boolean',
    description: 'Initialize jest configuration',
    default: false
  },
  typescript: {
    type: 'boolean',
    description: 'Make it a typescript project',
    default: false
  },
  yarn: {
    type: 'boolean',
    description: 'Use yarn instead of npm',
    default: true
  }
})

/**
 * @param {object} data
 * You'll want to change data.options to match what you have in your
 * @param {{ name: string, debug: boolean, docker: boolean, git: boolean, lint: boolean, test: boolean, typescript: boolean, yarn: boolean }} data.options - The resolved options as defined from above
 * @param {object} data.operations
 * @param {(fromPath: string|string[], toPath: string|string[]) => void} data.operations.copy -
 *   Copy a file from fromPath (a relative path from the root of this repo) to
 *   toPath (a relative path from the root of the destination directory)
 * @param {(fromPath: string|string[], toPath: string|string[], variables: object) => void} data.operations.template -
 *   Copy a file from fromPath (a relative path from the root of this repo) to
 *   toPath (a relative path from the root of the destination directory) and
 *   replace expressions in the file "{{variableName}}" with values present in
 *   the variables argument
 * @param {(object: object, toPath: string|string[]) => void} data.operations.json -
 *   Render the raw object to the toPath (A relative path from the root of the
 *   destination directory)
 * @param {(command: string, ...args: string|string[]) => void} data.operations.spawn -
 *   Run the command in a spawned process
 */
exports.run = ({ options, operations }) => {
  const dependencies = new Set()
  const devDependencies = new Set()
  const packageJSON = {
    name: undefined,
    description: '',
    version: '0.0.0',
    author: undefined,
    license: undefined,
    private: true,
    main: undefined,
    bin: undefined,
    scripts: {
      build: undefined,
      format: undefined,
      lint: undefined,
      start: undefined,
      'start:dev': undefined,
      test: undefined
    },
    dependencies: {},
    devDependencies: {}
  }

  packageJSON.name = options.name
  packageJSON.main = options.typescript ? 'dist/index.js' : 'src/index.js'
  packageJSON.scripts.start = 'node .'
  const nodemonOptions = []
  if (options.debug) nodemonOptions.push('--inspect=0.0.0.0:9229')
  if (options.typescript) nodemonOptions.push('--require=ts-node/register')
  // This goes at the end
  if (options.typescript) nodemonOptions.push('src/index.ts')
  const nodemonFlags = nodemonOptions.join(' ')
  packageJSON.scripts['start:dev'] = `nodemon ${nodemonFlags}`.trim()

  devDependencies.add('nodemon')

  operations.template(['template', 'README.md.template'], ['README.md'], {
    name: options.name
  })

  const indexFile = options.typescript ? 'index.ts' : 'index.js'
  operations.copy(['template', 'src', indexFile], ['src', indexFile])

  // ===========================================================================
  // debug
  // ===========================================================================
  if (options.debug) {
    operations.copy(
      [
        'template',
        '_vscode',
        options.docker ? 'launch.docker.json' : 'launch.json'
      ],
      ['.vscode', 'launch.json']
    )
  }

  // ===========================================================================
  // docker
  // ===========================================================================
  if (options.docker) {
    packageJSON.bin = packageJSON.main
    operations.copy(['template', '.gitignore'], ['.dockerignore'])
    operations.template(
      [
        'template',
        options.debug
          ? 'docker-compose.debug.yaml.template'
          : 'docker-compose.yaml.template'
      ],
      ['docker-compose.yaml'],
      {
        name: options.name
      }
    )
    const lockFile = options.yarn ? 'yarn.lock' : 'package-lock.json'
    const installCommand = options.yarn ? 'yarn' : 'npm install'
    const buildCommand = options.typescript
      ? `RUN ${options.yarn ? 'yarn' : 'npm run'} build\n`
      : ''
    const ports = ['3000']
      .concat(options.debug ? '9229' : null)
      .filter(Boolean)
      .join(' ')
    const runCommand = options.yarn ? '"yarn"' : '"npm", "run"'
    operations.template(['template', 'Dockerfile.template'], ['Dockerfile'], {
      lockFile,
      installCommand,
      buildCommand
    })
    operations.template(
      ['template', 'Dockerfile.dev.template'],
      ['Dockerfile.dev'],
      {
        lockFile,
        installCommand,
        ports,
        runCommand
      }
    )
  }

  // ===========================================================================
  // git
  // ===========================================================================
  if (options.git) {
    operations.copy(['template', '.gitignore'], ['.gitignore'])
  }

  // ===========================================================================
  // lint
  // ===========================================================================
  if (options.lint) {
    const ext = options.typescript ? 'ts' : 'js'
    const src = `'src/**/*.${ext}'`
    packageJSON.scripts.format = `prettier-eslint ${src} --write`
    packageJSON.scripts.lint = `eslint ${src} && prettier-eslint ${src} --list-different`
    devDependencies
      .add('eslint')
      .add('eslint-config-standard')
      .add('eslint-plugin-import')
      .add('eslint-plugin-node')
      .add('eslint-plugin-promise')
      .add('eslint-plugin-standard')
      .add('prettier-eslint-cli')
    if (options.typescript) devDependencies.add('@typescript-eslint/parser')
    operations.copy(
      ['template', options.typescript ? '.eslintrc.typescript' : '.eslintrc'],
      ['.eslintrc']
    )
  }

  // ===========================================================================
  // test
  // ===========================================================================
  if (options.test) {
    packageJSON.scripts.test = 'jest'
    devDependencies.add('jest')
    if (options.typescript) devDependencies.add('@types/jest').add('ts-jest')
    operations.copy(
      [
        'template',
        options.typescript ? 'jest.config.typescript.js' : 'jest.config.js'
      ],
      ['jest.config.js']
    )
  }

  // ===========================================================================
  // typescript
  // ===========================================================================
  if (options.typescript) {
    packageJSON.scripts.build = 'tsc'
    dependencies.add('typescript').add('@types/node')
    devDependencies.add('ts-node')
    operations.copy(['template', 'tsconfig.json'], ['tsconfig.json'])
  }

  if (options.git) operations.spawn('git', ['init'])
  operations.json(packageJSON, ['package.json'])

  const installCommand = options.yarn ? 'yarn' : 'npm'
  const installArg = options.yarn ? 'add' : 'install'
  const devFlag = options.yarn ? '--dev' : '--save-dev'
  const baseArgs = [installArg]
  const devArgs = baseArgs.concat([devFlag, ...devDependencies])
  const prodArgs = baseArgs.concat([...dependencies])
  if (dependencies.size) operations.spawn(installCommand, prodArgs)
  if (devDependencies.size) operations.spawn(installCommand, devArgs)
}
