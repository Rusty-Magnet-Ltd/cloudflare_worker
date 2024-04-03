import { expect, it, describe } from 'vitest'
import app from "../src";


describe('unit test environment ready', () => {
    it('vitest working', () => {
        expect(1 === 1).toBeTruthy();
    })
})
describe('suite', () => {
    it('ok', async () => {
        const res = await app.request('/')
        expect(res.status).toBe(200)
    })

    it('Non routed page gives a 404', async () => {
        const res = await app.request('/garbage')
        expect(res.status).toBe(404)
    })
})