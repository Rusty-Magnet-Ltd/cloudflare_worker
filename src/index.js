import {
	error,              // error Responses
	json,               // JSON Responses
	Router
} from 'itty-router'

const router = Router()

router
	// GET todos - just return some data!
	.get('/',
		( req ) => req.cf || error(500, 'can\'t access Cloudflare object ')
	)

	// return a 404 for anything else
	.all('*', () => error(404))

// Example showing Cloudflare module syntax
export default {
	fetch: (req, env, ctx) => router
		.handle(req, env, ctx)
		.then(json)
		.catch(error)
}