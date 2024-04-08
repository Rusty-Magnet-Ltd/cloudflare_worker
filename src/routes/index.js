import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { poweredBy } from 'hono/powered-by'

import { serveStatic } from 'hono/cloudflare-workers'
import manifest from '__STATIC_CONTENT_MANIFEST'

import generate from './generate'
import verify from "./verify";

const app = new Hono()


app.use(logger())
app.use(prettyJSON())
app.use(poweredBy())

app.get('/static/*', serveStatic({ root: './', manifest }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico', manifest  }))
app.get('/', (c) => c.text('This is Home! You can access: /static/fallback.txt'))

app.notFound((c) => {return c.text('RM custom 404 Message', 404)})
app.onError((err, c) => {
    console.error(`${err}`)
    return c.text('RM custom Error Message', 500)
})

app.route('/', generate)
app.route('/', verify)
export default app