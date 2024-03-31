import http from 'http'
import { createReadStream } from 'fs'
import { URL } from 'url'
import pth from 'path'
import { getContext } from './esbuild'
import { findFile, contentTypes, exists, htmlDev } from './utils'
import { getConfig } from './config'
import { debuglog } from 'util'

const log = debuglog('instjs')


export async function dev(opts: {root: string, global: string, port: string, dist: string}) {

  const {root, dist, globalName} = await getConfig({
    root: opts.root,
    globalName: opts.global,
    dist: opts.dist
  })

  const clients: Array<http.ServerResponse> = []

  const ctx = await getContext({root, dist, globalName, onEnd: (result) => {
    if (result.errors.length) {
      result.errors.forEach(err => console.log(err))
      return
    }
    clients.forEach(res => res.write('data: update\n\n'))
  }})
  await ctx.watch()

  const server = http.createServer(async (req, res) => {

    if (req.headers.accept?.includes('text/event-stream')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      })
      clients.push(res)
      log(`client connected, ${clients.length} clients`)
      req.once('close', () => {
        clients.splice(clients.indexOf(res), 1)
        log(`client disconnected, ${clients.length} remains`)
      })
      return
    }

    const url = new URL(req.url, `http://${req.headers.host}`)
    const ext = pth.extname(url.pathname)
    const contentType = contentTypes[ext.slice(1)]

    if (!ext) {
      if (!await exists(pth.join(root, url.pathname.slice(1)))) {
        console.log(404, req.url)
        res.writeHead(404)
        res.end()
        return
      }

      res.setHeader('content-type', 'text/html')
      res.end(htmlDev('index.js', {globalName}))
      return
    }

    const file = await findFile([
      pth.join('public', url.pathname.slice(1)),
      pth.join(dist, url.pathname.slice(1)),
    ])

    if (file) {
      res.setHeader('content-type', contentType)
      createReadStream(file).pipe(res)
      return
    }

    console.log(404, req.url)
    res.writeHead(404)
    res.end()
  })

  const port = opts.port || '3003'
  server.listen(port, () => console.log(`visit http://localhost:${port}`))
}
