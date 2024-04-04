import { Hono } from 'hono'
export const SecurityHeaderName = 'X-Header';
export const SecurityHeaderValue = 'pickle';


const generate = new Hono()

generate.use(async (c, next) => {
    console.log(`[${c.req.method}] ${c.req.url}`)
    await next()
})

// Add a custom header
generate.use('/generate', async (c, next) => {
    await next()
    c.res.headers.set(SecurityHeaderName, SecurityHeaderValue)
})

generate.get('/generate', async (c, next) => {

    return c.body('thanks for visiting', 201, {
        'Content-Type': 'text/plain',
    })
})

export default generate