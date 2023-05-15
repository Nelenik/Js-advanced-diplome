import '../index.html';
import '../scss/index.scss';
import Navigo from 'navigo';
import { ServerApi } from './js-parts/_helpers';
import { Header } from './js-parts/_dom-helpers';

export const router = new Navigo('/');
export const request = new ServerApi('http://localhost:3000');

const appContainer = document.getElementById('bank-app');
//создаем экземпляр хедера. можно исопльзовать один и тот же хедер только включая или навигацию
const header = new Header(appContainer);

router.on(`/accounts`, (data) => {
	header.enableNav = true;
});
router.on(`/banks`, (data) => {
	header.enableNav = true;
});
router.on(`/currencies`, (data) => {
	header.enableNav = true;
});
router.on(`/`, (data) => {
	header.enableNav = false;
});
router.resolve();

request
	.postData('/login', { login: 'developer', password: 'skillbox' })
	.then(({ error, payload }) => {
		if (error) throw Error(error);
		if (payload) return request.getData('/accounts', payload.token);
	})
	.then((data) => console.log(data))
	.catch((err) => {
		switch (err.message) {
			case `Invalid password`:
				console.log('пытаемся войти с неверным паролем');
				break;
			case `No such user`:
				console.log(' пользователя с таким логином не существует');
				break;
			default:
				throw err;
		}
	});
