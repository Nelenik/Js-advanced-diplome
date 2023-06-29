/*
Класс ServerApi представляет собой обёртку для взаимодействия с серверным API.  */
export class ServerApi {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}
	/*getToken(): Получает токен из хранилища сеанса (sessionStorage). Если токен отсутствует, генерируется ошибка "Session expired" (сеанс истек). */
	getToken() {
		const token = sessionStorage.getItem('token');
		if (token) return token;
		else throw Error('Session expired');
	}
	/*processResponse(response): Обрабатывает ответ от сервера, извлекая ошибку и полезную нагрузку из JSON-ответа. Если есть ошибка, генерируется соответствующая ошибка; если есть полезная нагрузка, она возвращается; в противном случае генерируется ошибка "Нет данных". */
	async processResponse(response) {
		const { error, payload } = await response.json();
		if (error) throw Error(error);
		if (payload) {
			return payload;
		} else {
			throw Error('Нет данных');
		}
	}
	/*post(path, bodyData, enableToken = false): Выполняет POST-запрос по указанному пути path с данными bodyData. Возможно включение токена авторизации */
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
	/*get(path, enableToken = false): Выполняет GET-запрос по указанному пути path. Возможно включение токена авторизации. */
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
	/*login(bodyData): Выполняет вход пользователя, отправляя POST-запрос на путь '/login' с данными bodyData. Сохраняет полученный токен в sessionStorage. */
	async login(bodyData) {
		const payload = await this.post('/login', bodyData);
		sessionStorage.setItem('token', payload.token);
	}
	/*createCount(): Создает новый счет, отправляя POST-запрос на путь '/create-account'. Возможно включение токена авторизации. */
	async createCount() {
		return this.post('/create-account', {}, true);
	}
	/*getCounts(): Получает список счетов, отправляя GET-запрос на путь '/accounts'. Возможно включение токена авторизации. */
	async getCounts() {
		return this.get('/accounts', true);
	}
	/*getCountInfo(id): Получает информацию о счете с указанным идентификатором id, отправляя GET-запрос на путь /account/${id}. Возможно включение токена авторизации. */
	async getCountInfo(id) {
		return this.get(`/account/${id}`, true);
	}
	/*sendTransfer(bodyObj): Отправляет запрос на выполнение перевода средств, отправляя POST-запрос на путь '/transfer-funds' с данными bodyObj. Возможно включение токена авторизации.*/
	async sendTransfer(bodyObj) {
		return this.post('/transfer-funds', bodyObj, true);
	}
	/*getAllCurrencies(): GET-Метод отвечает массивом со списком кодов всех используемых бекэндом валют на данный момент*/
	async getAllCurrencies() {
		return this.get('/all-currencies');
	}
	/*getUserCurrencies(): Получает инфомрацию о валютных счетах пользователя, отправляя GET-запрос. нужен токен авторизации */
	async getUserCurrencies() {
		return this.get('/currencies', true);
	}
	/*convert(bodyObj): Отправляет POST-запрос на конвертацию между валютными счетами пользователя. нужен токен авторизации */
	async convert(bodyObj) {
		return this.post('/currency-buy', bodyObj, true);
	}

	async getBanks() {
		return this.get('/banks');
	}
}
