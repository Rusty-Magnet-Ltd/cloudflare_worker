import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('success'))

app.notFound((c) => {
    return c.text('RM custom 404 Message', 404)
})

app.onError((err, c) => {
    console.error(`${err}`)
    return c.text('Custom Error Message', 500)
})


export default app