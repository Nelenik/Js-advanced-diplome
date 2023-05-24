import '../index.html';
import '../scss/index.scss';
import Navigo from 'navigo';
import { el, mount } from 'redom';
import { routes } from './js-parts/_routes'; //маршруты
import { ServerApi } from './js-parts/_server-api'; //класс с методами запросов
import { Header } from './js-parts/_header'; // класс хедера
import { authPage } from './js-parts/auth-page'; //страница авторизации
import { countsPage } from './js-parts/counts-page';

export const router = new Navigo(routes.auth);
export const request = new ServerApi('http://localhost:3000');

const appContainer = document.getElementById('bank-app');
//создаем экземпляр хедера. можно исопльзовать один и тот же хедер только включая или выключая меню
const headerInstance = new Header({
	appContainer: appContainer,
});
// контейнер со содержимым страницы
const main = el('main.page');
mount(appContainer, main);

// регистрируем роутеры
router.on(routes.auth, () => {
	authPage(main, headerInstance);
	sessionStorage.removeItem('token');
});
router.on(routes.accounts, () => {
	countsPage(main, headerInstance);
});
router.on(routes.banks, (data) => {
	main.innerHTML = '';
	headerInstance.enableMenu = true;
});
router.on(routes.currencies, (data) => {
	main.innerHTML = '';
	headerInstance.enableMenu = true;
});
router.on(routes.countInfo, (data) => {
	Header.mainMenuLinks.forEach((link) =>
		link.classList.remove('header__link--active')
	);
});
router.resolve();
