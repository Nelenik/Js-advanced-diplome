// export class ServerApi {
// 	constructor(baseUrl) {
// 		this.baseUrl = baseUrl;
// 	}

// 	async postData(request, bodyData, token) {
// 		const res = await fetch(this.baseUrl + request, {
// 			method: 'POST',
// 			body: JSON.stringify(bodyData),
// 			headers: {
// 				'Content-Type': 'application/json',
// 				Authorization: token ? `Basic ${token}` : '',
// 			},
// 		});
// 		return await res.json();
// 	}

// 	async getData(request, token) {
// 		const res = await fetch(this.baseUrl + request, {
// 			headers: {
// 				Authorization: token ? `Basic ${token}` : '',
// 			},
// 		});
// 		return await res.json();
// 	}
// }

export class ServerApi {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}

	getToken() {
		const token = sessionStorage.getItem('token');
		if (token) return token;
		else throw Error('Session expired');
	}

	async post(path, bodyData, enableToken = false) {
		const res = await fetch(this.baseUrl + path, {
			method: 'POST',
			body: JSON.stringify(bodyData),
			headers: {
				'Content-Type': 'application/json',
				Authorization: enableToken ? `Basic ${this.getToken()}` : '',
			},
		});
		if (res.ok) {
			const { error, payload } = await res.json();
			if (error) throw Error(error);
			if (payload) {
				return payload;
			} else {
				throw Error('Нет данных');
			}
		}
		// return await res.json();
	}

	async get(path, enableToken = false) {
		const res = await fetch(this.baseUrl + path, {
			headers: {
				Authorization: enableToken ? `Basic ${this.getToken()}` : '',
			},
		});
		return await res.json();
	}

	async login(bodyData) {
		// const { error, payload } = await this.post('/login', bodyData);
		const payload = await this.post('/login', bodyData);
		sessionStorage.setItem('token', payload.token);
		// if (error) throw Error(error);
		// if (payload) {
		// 	sessionStorage.setItem('token', payload.token);
		// }
	}

	async authorization() {
		return this.get('/accounts', true);
	}
}
