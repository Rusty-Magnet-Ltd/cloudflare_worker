import { Hono } from 'hono'

const app = new Hono()


app.get('/', (c) => {
    return c.body('Thank you for coming', 200, {
        'Content-Type': 'text/plain',
        })
    })

app.notFound((c) => {
    return c.text('RM custom 404 Message', 404)
})

app.onError((err, c) => {
    console.error(`${err}`)
    return c.text('RM custom Error Message', 500)
})


export default app