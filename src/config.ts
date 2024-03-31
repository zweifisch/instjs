import { promises as fs } from 'fs'
import { exists } from './utils'

interface Config {
  root: string
  globalName: string
  dist: string
}

const configFile = 'instjs.json'

export const getConfig = async (kvs: Partial<Config>) => {

  const conf: Config = {
    root: 'src/pages',
    globalName: '__INSTJS__',
    dist: 'dist',
  }

  if (await exists(configFile)) {
    Object.assign(conf, JSON.parse(await fs.readFile(configFile, 'utf-8')))
  }

  for (const [key, val] of Object.entries(kvs)) {
    if (val) {
      conf[key] = val
    }
  }

  return conf
}

export const writeConfig = async (kvs: Partial<Config>) => {
  const config = getConfig(kvs)
  await fs.writeFile(configFile, JSON.stringify(config, null, 2), 'utf-8')
}
