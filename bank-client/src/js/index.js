import '../index.html';
import '../scss/index.scss';
import Navigo from 'navigo';
import { el, mount } from 'redom';
import { ServerApi } from './js-parts/_server-api';
import { Header } from './js-parts/_header';
import { authPage } from './js-parts/_authorization';

export const router = new Navigo('/');
export const request = new ServerApi('http://localhost:3000');

const appContainer = document.getElementById('bank-app');
//создаем экземпляр хедера. можно исопльзовать один и тот же хедер только включая или меню
const header = new Header({
	appContainer: appContainer,
});
const main = el('main.page');
mount(appContainer, main);

// регистрируем роутеры
router.on(`/accounts`, (data) => {
	main.innerHTML = '';
	header.enableMenu = true;
});
router.on(`/banks`, (data) => {
	main.innerHTML = '';
	header.enableMenu = true;
});
router.on(`/currencies`, (data) => {
	main.innerHTML = '';
	header.enableMenu = true;
});
router.on(`/`, (data) => {
	main.innerHTML = '';
	header.enableMenu = false;
	authPage(main);
});
router.resolve();
