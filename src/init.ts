import { promises as fs } from 'fs'
import { getConfig, writeConfig } from './config'
import { ensureDir } from './utils'
import pth from 'path'
import zlib from 'zlib'


const templates = {

  tsx: `\
export default function MyPage() {
  return <div>TODO</div>
}
`
}

export async function init(opts: {root: string, dist: string}, name: string) {

  await ensureDir(name)
  process.chdir(name)

  const config = await getConfig({root: opts.root, dist: opts.dist})

  await ensureDir(config.root)
  const path = pth.join(config.root, `index.tsx`)
  await fs.writeFile(path, templates.tsx, 'utf-8')
  console.log(`wrote ${path}`)

  await ensureDir('public')
  const favicon = pth.join('public', `favicon.ico`)
  await fs.writeFile(favicon, zlib.unzipSync(Buffer.from(`\
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\
`, 'base64')))
  console.log(`wrote ${favicon}`)

  await fs.writeFile('package.json', JSON.stringify({
    name,
    devDependencies: {
      instjs: "^1",
    },
    scripts: {
      dev: 'instjs dev',
      build: 'instjs build'
    }
  }, null, 2), 'utf-8')

  await writeConfig(config)
}
