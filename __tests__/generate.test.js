import {describe, expect, it} from "vitest";
import app from "../src/routes";
import {SecurityHeaderName, SecurityHeaderValue} from "../src/routes/generate";

describe('test generate route', () => {
    it('return a 201', async () => {
        const res = await app.request('/generate')
        expect(res.status).toBe(201)
        expect(res.headers.get(SecurityHeaderName)).toBe(SecurityHeaderValue)
    })
})