export class ServerApi {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}

	async postData(request, bodyData, token) {
		const res = await fetch(this.baseUrl + request, {
			method: 'POST',
			body: JSON.stringify(bodyData),
			headers: {
				'Content-Type': 'application/json',
				Authorization: token ? `Basic ${token}` : '',
			},
		});
		return await res.json();
	}

	async getData(request, token) {
		const res = await fetch(this.baseUrl + request, {
			headers: {
				Authorization: token ? `Basic ${token}` : '',
			},
		});
		return await res.json();
	}
}
