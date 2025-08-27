import type {} from '@hono/hono'
import type { D1Database } from '@cloudflare/workers-types'

declare module '@hono/hono' {
  interface Env {
    Bindings: {
      DB: D1Database
    }
  }
}