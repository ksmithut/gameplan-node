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
 * @typedef {{[key: string]: OptionDefinition}} OptionDefinitions
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
    default: path.basename(directory)
  },
  docker: {
    type: 'boolean',
    description: 'Add docker files to the project',
    default: false
  },
  kubernetes: {
    type: 'boolean',
    description: 'Put in kubernetes related files',
    default: false
  },
  test: {
    type: 'boolean',
    description: 'Initialize jest configuration',
    default: false
  },
  gitInit: {
    type: 'boolean',
    description: 'Start with new git repo',
    default: true
  },
  gitHooks: {
    type: 'boolean',
    description: 'Use git hooks to format code',
    default: false
  },
  template: {
    type: 'string',
    description: 'Choose which template to use',
    default: 'simple',
    choices: ['simple', 'web']
  }
})

/**
 * @param {object} data
 * You'll want to change data.options to match what you have in your
 * @param {{ name: string, debug: boolean, docker: boolean, test: boolean, gitInit: boolean, gitHooks: boolean, kubernetes: boolean, template: 'simple' | 'web' }} data.options - The resolved options as defined from above
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
 * @param {(command: string, ...args: (string|string[])[]) => void} data.operations.spawn -
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
    type: undefined,
    engines: {
      node: '>=14.x'
    },
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
  packageJSON.main = 'src/index.js'
  packageJSON.scripts.start = 'node .'
  packageJSON.scripts['start:dev'] = 'nodemon --inspect=0.0.0.0:9229'
  packageJSON.type = 'module'

  if (options.template === 'web') {
    packageJSON.bin = 'src/bin/server.js'
    packageJSON.scripts.start = 'node src/bin/server.js'
    packageJSON.scripts['start:dev'] =
      'nodemon --inspect=0.0.0.0:9229 src/bin/server.js | pino-pretty'
    dependencies.add('zod@next')
    dependencies.add('pino')
    devDependencies.add('pino-pretty').add('@types/pino')
    dependencies.add('dotenv')
    dependencies.add('fastify')
    dependencies.add('commander')
  }

  devDependencies.add('nodemon')

  operations.template(['templates', 'README.md'], ['README.md'], {
    name: options.name
  })

  operations.copy(['templates', `src-${options.template}`], ['src'])

  // ===========================================================================
  // debug
  // ===========================================================================
  operations.copy(['templates', '_vscode'], ['.vscode'])

  // ===========================================================================
  // docker
  // ===========================================================================
  if (options.docker) {
    operations.copy(['templates', '.dockerignore'], ['.dockerignore'])
    operations.template(
      ['templates', 'docker-compose.yaml'],
      ['docker-compose.yaml'],
      {
        name: options.name
      }
    )
    operations.copy(['templates', 'Dockerfile'], ['Dockerfile'])
    operations.copy(['templates', 'Dockerfile.dev'], ['Dockerfile.dev'])

    if (options.kubernetes) {
      operations.template(['templates', 'skaffold.yaml'], ['skaffold.yaml'], {
        name: options.name
      })
      operations.template(['templates', 'k8s.yaml'], ['k8s.yaml'], {
        name: options.name
      })
    }
  }

  // ===========================================================================
  // git
  // ===========================================================================
  operations.copy(['templates', '.gitignore'], ['.gitignore'])

  // ===========================================================================
  // lint
  // ===========================================================================
  packageJSON.scripts.format = 'prettier-standard'
  packageJSON.scripts.lint = 'prettier-standard --check --lint'
  devDependencies
    .add('standard')
    .add('prettier-standard')
    .add('typescript')
    .add('@types/node')
  operations.copy(['templates', 'tsconfig.json'], ['tsconfig.json'])
  operations.copy(['templates', '.eslintrc.json'], ['.eslintrc.json'])

  // ===========================================================================
  // test
  // ===========================================================================
  if (options.test) {
    packageJSON.scripts.test = 'jest'
    devDependencies.add('jest')
    operations.copy(['templates', 'jest.config.js'], ['jest.config.js'])
  }

  // ===========================================================================
  // git
  // ===========================================================================
  if (options.gitInit) {
    operations.spawn('git', ['init'])
    if (options.gitHooks) {
      operations.copy(['templates', '.huskyrc.json'], ['.huskyrc.json'])
      operations.copy(['templates', '.lintstagedrc.cjs'], ['.lintstagedrc.cjs'])
      devDependencies.add('husky').add('lint-staged')
    }
  }

  operations.json(packageJSON, ['package.json'])

  if (dependencies.size) operations.spawn('yarn', ['add', ...dependencies])
  if (devDependencies.size) {
    operations.spawn('yarn', ['add', '--dev', ...devDependencies])
  }
}
