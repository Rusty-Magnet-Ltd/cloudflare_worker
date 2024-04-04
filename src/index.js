import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import manifest from '__STATIC_CONTENT_MANIFEST'

const app = new Hono()

/* static landing page */
app.get('/static/*', serveStatic({ root: './', manifest }))
app.get('/favicon.ico', serveStatic({ path: './favicon.ico' }))

app.get('/', (c) => c.redirect('/static/home/index.html'))
app.get('/health', (c) => c.text('success'))

app.notFound((c) => {
    return c.text('RM custom 404 Message', 404)
})

app.onError((err, c) => {
    console.error(`${err}`)
    return c.text('Custom Error Message', 500)
})


export default app