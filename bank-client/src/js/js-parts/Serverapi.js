export class ServerApi {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}

	getToken() {
		const token = sessionStorage.getItem('token');
		if (token) return token;
		else throw Error('Session expired');
	}

	async processResponse(response) {
		const { error, payload } = await response.json();
		if (error) throw Error(error);
		if (payload) {
			return payload;
		} else {
			throw Error('Нет данных');
		}
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
			return await this.processResponse(res);
		}
	}

	async get(path, enableToken = false) {
		const res = await fetch(this.baseUrl + path, {
			headers: {
				Authorization: enableToken ? `Basic ${this.getToken()}` : '',
			},
		});
		if (res.ok) {
			return await this.processResponse(res);
		}
	}

	async login(bodyData) {
		const payload = await this.post('/login', bodyData);
		sessionStorage.setItem('token', payload.token);
	}

	async createCount() {
		return this.post('/create-account', {}, true);
	}

	async getCounts() {
		return this.get('/accounts', true);
	}

	async getCountInfo(id) {
		return this.get(`/account/${id}`, true);
	}

	async sendTransfer(bodyObj) {}
}
