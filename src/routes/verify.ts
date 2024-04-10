import {Hono} from "hono";
import { verify } from 'hono/jwt'
import { validator } from 'hono/validator';
import { SecurityHeaderName } from "./generate";
import {SecretPayload} from "../model/payload";

const vrfy = new Hono()
const secretKey = 'mySecretKey'

vrfy.get('/verify',
    validator('header', async (value, c) => {
        const tokenToVerify = value[SecurityHeaderName.toLowerCase()]
        if (!tokenToVerify || tokenToVerify.length === 0) {
            return c.text('Invalid! Either no value or value not a string', 400)
        }
        try {
            const decodedPayload = await verify(tokenToVerify, secretKey, 'HS256')
            console.log(decodedPayload)
            return {
                val: decodedPayload,
            }
        } catch (error) {
            console.log(`Verify failed.`);
            if (error instanceof Error) console.error(error.message)
            return c.text('jwt verify failed', 401)
        }
    }),

    (c) => {
        // @ts-ignore
        const { val } = c.req.valid('header')
        const originalPayload = val as SecretPayload;

        return c.json(
            {
                message: `Success.  Verified message wasn't tampered.  User: ${originalPayload.name}`
            },
            201
        )
    })

export default vrfy