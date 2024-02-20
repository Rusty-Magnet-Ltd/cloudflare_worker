
export default {
	async fetch(req) {
		const cfobj =
			req.cf !== undefined
				? req.cf
				: { error: "The `cf` object is not available inside the preview." };

		// bot score has to be optional for free zones
		const resp= {
				asn_number: cfobj?.asn,
				asn_name: cfobj?.asOrganization,
				country: cfobj?.country,
				bot_score: cfobj?.botManagement?.score,
				attestation: req.headers.has('att'),
				attestation_value: req.headers.get('att'),
		}

		let headers = new Headers();
		headers.set('x-foo', '123');
		headers.set("content-type", "application/json;charset=UTF-8")
		return new Response(JSON.stringify(resp, null, 2), {
			headers: headers,
		});
	},
};
