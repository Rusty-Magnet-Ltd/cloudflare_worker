import { Hono } from 'hono'
import { sign } from 'hono/jwt'

export const SecurityHeaderName = 'X-Header';
const secret = 'mySecretKey'

const generate = new Hono()

generate.use(async (c, next) => {
    console.log(`[${c.req.method}] ${c.req.url}`)
    await next()
})

// Add a custom header

export function generateUserPayload() {
    const payload = {
        user: 'user123',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 60 * 1,
    }
    return payload
}
export async function signPayload(payload) {
    return await sign(payload, secret, 'HS256')
}

generate.use('/generate', async (c, next) => {
    await next()
    const payload = generateUserPayload()
    const token = signPayload(payload)
    c.res.headers.set(SecurityHeaderName, await token)
})

generate.get('/generate', async (c, next) => {


    return c.body('thanks for visiting', 201, {
        'Content-Type': 'text/plain',
    })
})



export default generate