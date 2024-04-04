import { Hono } from 'hono'
import { validator } from 'hono/validator'

const app = new Hono()

const SecurityHeaderName = 'X-Header';
const SecurityHeaderValue = 'pickle';


// app.use(poweredBy())
app.get('/', (c) => {return c.text('/', 200)})

// specify path
app.use(async (c, next) => {
    console.log(`[${c.req.method}] ${c.req.url}`)
    await next()
})

// Add a custom header
app.use('/generate', async (c, next) => {
    await next()
    c.res.headers.set(SecurityHeaderName, SecurityHeaderValue)
})

app.get('/generate', async (c, next) => {

    return c.body('thanks for visiting', 201, {
        'Content-Type': 'text/plain',
    })
})

app.get
    ('/verify',
    validator('header', (value, c) => {
        const xHeader = value[SecurityHeaderName.toLowerCase()]
        if (!xHeader || typeof xHeader !== 'string') {
            return c.text('Invalid!', 400)
        }
        return {
            val: xHeader,
        }
    }),

    (c) => {
        const { val } = c.req.valid('header')
        return c.json(
            {
                message: 'thanks for verifying header! Secret value is:' + val,
            },
            201
        )

})


app.notFound((c) => {
    return c.text('RM custom 404 Message', 404)
})

app.onError((err, c) => {
    console.error(`${err}`)
    return c.text('RM custom Error Message', 500)
})


export default app