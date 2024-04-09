import {describe, expect, it} from "vitest";
import app from "../src/routes";
import {SecurityHeaderName, signPayload} from "../src/routes/generate";
import {SecretPayload} from "../src/model/payload";

describe('test verify route', () => {
    it('verify request without header', async () => {
        const res = await app.request('/verify')
        expect(res.status).toBe(400)
    })

    it('verify ok', async () => {
        const payload = new SecretPayload("Tom Hanks")
        const token = await signPayload(payload)
        const req = new Request('http://localhost:8787/verify', {
            method: 'GET',
            headers: {
                [SecurityHeaderName]: token,
            },
        })
        const res = await app.request(req)
        expect(res.status).toBe(201)
    })

})