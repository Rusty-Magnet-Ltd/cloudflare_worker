import { AutoRouter } from 'itty-router' // ~1kB

const router = AutoRouter()

router
    .get('/hello/:name', ({ name }) => `Hello, ${name}!`)
    .get('/json', () => [1,2,3])
    .get('/promises', () => Promise.resolve('foo'))

export default router