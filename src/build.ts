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
  ctx.dispose()

  const files = (await readDir(root)).filter(x => x.endsWith('index.tsx'))

  for (const file of files) {
    const dest = pth.dirname(pth.join(dist, pth.relative(root, file)))
    ensureDir(dest)
    await fs.writeFile(
      pth.join(dest, 'index.html'),
      html('index.js', {globalName}),
      'utf8'
    )
  }

  if (await fs.access('public').then(() => true, () => false)) {
    await fs.cp('public', dist, { recursive: true })
  }
}
