import {describe, expect, it} from "vitest";
import app from "../src/routes";

describe('test home route', () => {
    it('return a 200 and powered by header', async () => {
        const res = await app.request('/')
        expect(res.status).toBe(200)
        const val = res.headers.get('x-powered-by') as string
        expect(val.toLowerCase()).toBe('hono')
    })
})




// const fooHeaders: FooHeaders[] = [{
//     name: "User-Agent",
//     "value": c.req.header('User-Agent'),
// }, {
//     title: "asn",
//     description: c.req.header('foo-asn'),
// },{
//     title: "Country",
//     description: c.req.header('foo-country'),
// },{
//     title: "IP address",
//     description: c.req.header('foo-ip'),
// },{
//     title: "Cloudflare Ray ID",
//     description: c.req.header('foo-ray-id'),
// }]}