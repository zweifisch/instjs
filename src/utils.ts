import { promises as fs } from 'fs'
import pth from 'path'


export function exists(path: string) {
  return fs.access(path).then(() => true, () => false)
}

export async function findFile(files: Array<string>) {
  for (const file of files) {
    try {
      await fs.access(file)
      return file
    } catch {}
  }
}

export async function readDir(root: string) {
  const files = await fs.readdir(root)
  const ret: Array<string> = []
  for (const file of files) {
    const filePath = pth.join(root, file)
    const stats = await fs.stat(filePath)
    if (stats.isDirectory()) {
      ret.push(... await readDir(filePath))
    } else {
      ret.push(filePath)
    }
  }
  return ret
}

export const htmlDev = (entry: string, opts: {globalName: string}) => `\
<!doctype html><meta charset=utf-8><head>\
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>\
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>\
<script src="${entry}"></script>\
<style>* {margin: 0; padding: 0;} body {background: #eee;}</style>\
<title></title></head><div id=main></div>\
<script>new EventSource("").onmessage = () => location.reload()</script>\
<script>ReactDOM.render(React.createElement(${opts.globalName}.default),document.getElementById('main'))</script>\
`

export const html = (entry: string, opts: {globalName: string}) => `\
<!doctype html><meta charset=utf-8><head>\
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>\
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>\
<script src="${entry}"></script>\
<style>* {margin: 0; padding: 0;} body {background: #eee;}</style>\
<title></title></head><div id=main></div>\
<script>ReactDOM.render(React.createElement(${opts.globalName}.default),document.getElementById('main'))</script>\
`

export const contentTypes = {
  js: 'text/javascript',
  css: 'text/css',
  json: 'application/json',
  pdf: 'application/pdf',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  ico: 'image/vnd.microsoft.icon',
}

export async function ensureDir(dir: string) {
  if (pth.dirname(dir) === dir) return
  await fs.stat(dir).catch(async () => {
    await ensureDir(pth.dirname(dir))
    await fs.mkdir(dir)
  })
}

export function parseCliArgs(args: Array<string>) {
  const opts: Record<string, string | boolean> = {}
  const pargs: Array<string> = []
  let key = ''
  for (const arg of args) {
    if (arg.startsWith('--')) {
      if (key) {
        opts[key] = true
      }
      key = arg.slice(2)
      continue
    }
    if (key) {
      opts[key] = arg
      key = ''
      continue
    }
    pargs.push(arg)
  }

  if (key) {
    opts[key] = true
  }

  return [opts, pargs] as const
}
