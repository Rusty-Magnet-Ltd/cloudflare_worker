import {
	error,              // creates error Responses
	json,               // creates JSON Responses
	Router,             // the Router itself
} from 'itty-router'

const router = Router()

router
	// GET todos - just return some data!
	.get('/', ( req ) => req.cf || error(404, 'That todo was not found'))

	// return a 404 for anything else
	.all('*', () => error(404))

// Example showing Cloudflare module syntax
export default {
	fetch: (req, env, ctx) => router
		.handle(req, env, ctx)
		.then(json)
		.catch(error)
}