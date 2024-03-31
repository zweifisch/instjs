import { build } from './build'
import { dev } from './dev'
import { init } from './init'
import { parseCliArgs } from './utils'


export async function main() {
  const commands = {
    build,
    dev,
    init,
  }

  const [_bin, _script, _command, ...args] = process.argv

  const command = _command || 'dev'
  const key = command.split('-').join('_')

  if (!commands[key]) {
    console.log(`${command} is not a valid command`)
    process.exit(1)
  }

  const [opts, pargs] = parseCliArgs(args)
  try {
    const result = await commands[key](opts, ...pargs)
    if (typeof result === 'string') {
      console.log(result)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

