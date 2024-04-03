import { AutoRouter, error } from 'itty-router'

// upstream middleware to embed a start time
const withBenchmarking = (request) => {
	request.start = Date.now()
}

// downstream handler to log it all out
const logger = (res, req) => {
	console.log(res.status, req.url, Date.now() - req.start,  'ms')
}

// now let's create the router
const router = AutoRouter({
	port: 3001,
	before: [withBenchmarking],
	missing: () => error(404, 'Custom 404 message.'),
	finally: [logger],
})

router.get('/', () => 'Success!')
router.get('/info', ( req ) => req.cf || error(500, 'can\'t access Cloudflare object '))
export default {
    fetch: router.fetch,
}
