
export default {
	async fetch(req) {
		const data =
			req.cf !== undefined
				? req.cf
				: { error: "The `cf` object is not available inside the preview." };

		console.log("debug has: ", req.headers.has('rooatt'));
		console.log("debug get: ", req.headers.get('rooatt'));

		return new Response(JSON.stringify(data, null, 2), {
			headers: {
				"content-type": "application/json;charset=UTF-8",
			},
		});
	},
};
