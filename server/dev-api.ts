import type { Plugin } from 'vite'

// Serves /api/* during `vite dev` by running the same handlers Vercel deploys.
export function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const match = /^\/api\/([a-z-]+)$/.exec(url.pathname)
        if (!match || req.method !== 'GET') return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`)
          if (typeof mod.GET !== 'function') return next()
          const response: Response = await mod.GET(new Request(url))
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          next(err)
        }
      })
    },
  }
}
