import esbuild from 'esbuild'
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals"
import { polyfillNode } from "esbuild-plugin-polyfill-node"
import { readDir } from './utils'


const notify = (opts: {onEnd: Function}) => ({
  name: 'notify',
  setup(build) {
    opts.onEnd && build.onEnd(opts.onEnd)
  }
})

export async function getContext(opts: {dist: string, globalName: string, root: string, onEnd?: Function}) {

  const files = (await readDir(opts.root)).filter(x => x.endsWith('index.tsx'))

  return esbuild.context({
    entryPoints: files,
    outdir: opts.dist,
    bundle: true,
    external: ['react', 'react-dom'],
    sourcemap: 'inline',
    globalName: opts.globalName,
    plugins: [
      globalExternals({
        'react': {
          varName: 'React',
          type: 'cjs',
        },
        'react-dom': {
          varName: 'ReactDOM',
          namedExports: ['createPortal'],
          type: 'esm'
        },
      }),
      polyfillNode({}),
      notify({onEnd: opts.onEnd}),
    ]
  })
}
