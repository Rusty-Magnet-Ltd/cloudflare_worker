import {SecurityHeaderName, SecurityHeaderValue} from "./generate";
import {Hono} from "hono";
import { validator } from 'hono/validator';

const verify = new Hono()


verify.get
('/verify',
    validator('header', (value, c) => {
        const xHeader = value[SecurityHeaderName.toLowerCase()]
        if (!xHeader || typeof xHeader !== 'string') {
            return c.text('Invalid!', 400)
        }
        if (xHeader !== SecurityHeaderValue){
            return c.text('wrong secret value', 400)
        }
        return {
            val: xHeader,
        }
    }),

    (c) => {
        const { val } = c.req.valid('header')
        return c.json(
            {
                message: 'thanks for verifying header! Secret value was: ' + val,
            },
            201
        )

    })

export default verify