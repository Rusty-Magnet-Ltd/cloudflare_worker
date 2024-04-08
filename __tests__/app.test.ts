import { expect, it, describe } from 'vitest'
import app from "../src/routes";


describe('basic set up of Hono working', () => {
    it('root path ok', async () => {
        const res = await app.request('/')
        expect(res.status).toBe(200)
    })

    it('Non routed page gives a 404', async () => {
        const res = await app.request('/garbage')
        expect(res.status).toBe(404)
    })
})