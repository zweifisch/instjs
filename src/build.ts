import { promises as fs } from 'fs'
import pth from 'path'
import { getContext } from './esbuild'
import { html, ensureDir, readDir } from './utils'
import { getConfig } from './config'


export async function build(opts: {root: string, dist: string, global: string}) {

  const {root, dist, globalName} = await getConfig({
    root: opts.root,
    globalName: opts.global,
    dist: opts.dist
  })

  const ctx = await getContext({root, dist, globalName})
  await ctx.rebuild()

  const files = (await readDir(root)).filter(x => x.endsWith('index.tsx'))

  for (const file of files) {
    ensureDir(file)
    await fs.writeFile(
      pth.join(pth.dirname(file), 'index.html'),
      html('index.js', {globalName}),
      'utf8'
    )
  }

  if (await fs.access('public').then(() => true, () => false)) {
    await fs.cp('public', dist, { recursive: true })
  }
}
