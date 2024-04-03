import { expect, test } from 'vitest'
import app from "../src";

test('vitest working', () => {
    expect(1 === 1).toBe(true);
});

test('GET / ok', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
})
