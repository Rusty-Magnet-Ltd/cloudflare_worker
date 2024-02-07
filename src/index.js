
export default {
	async fetch(req) {
		const cfobj =
			req.cf !== undefined
				? req.cf
				: { error: "The `cf` object is not available inside the preview." };

		console.log(cfobj['botManagement']['score']);

		const resp = {
			asn: cfobj["asn"],
			country: cfobj["country"],
			bot_score: cfobj['botManagement']['score'],
			attestation: req.headers.has('att'),
			attestation_value: req.headers.get('att'),
		};

		let headers = new Headers();
		headers.set('x-foo', '123');
		headers.set("content-type", "application/json;charset=UTF-8")
		return new Response(JSON.stringify(resp, null, 2), {
			headers: headers,
		});
	},
};
