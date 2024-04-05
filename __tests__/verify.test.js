import {describe, expect, it} from "vitest";
import app from "../src/routes";
import {SecurityHeaderName, SecurityHeaderValue} from "../src/routes/generate";

describe('test verify route', () => {
    it('verify request without header', async () => {
        const res = await app.request('/verify')
        expect(res.status).toBe(400)
    })

    it('verify request works', async () => {
        const req = new Request('http://localhost:8787/verify', {
            method: 'GET',
            headers: {
                [SecurityHeaderName]: SecurityHeaderValue,
            },
        })
        const res = await app.request(req)
        console.log(res)
        expect(res.status).toBe(201)
    })

})