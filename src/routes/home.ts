import { Hono } from 'hono'
import type { FC } from 'hono/jsx'

const home = new Hono()



home.get('/', (c) => c.html("hello <h1>world</h1><h1>"))

export default home