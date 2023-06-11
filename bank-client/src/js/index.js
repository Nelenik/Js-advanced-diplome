import '../index.html';
import '../scss/index.scss';
import Navigo from 'navigo';
import { el, mount } from 'redom';
import { routes } from './js-parts/_routes'; //маршруты
import { ServerApi } from './js-parts/Serverapi'; //класс с методами запросов
import { Header } from './js-parts/Header'; // класс хедера
import { authPage } from './js-parts/auth-page'; //страница авторизации
import { countsPage } from './js-parts/counts-page'; //все счета
import { countInfoPage } from './js-parts/count-info-page'; //информация об одном счете

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
router.on(routes.countInfo, (data) => {
	const match = data.queryString.match(/id=(.*)/);
	let id;
	if (match) id = match[1];
	else throw new Error('Такой счет не существует');
	countInfoPage(main, headerInstance, `${id}`);
	Header.mainMenuLinks.forEach((link) =>
		link.classList.remove('header__link--active')
	);
});
router.on(routes.banks, () => {
	main.innerHTML = '';
	headerInstance.enableMenu = true;
});
router.on(routes.currencies, () => {
	main.innerHTML = '';
	headerInstance.enableMenu = true;
});
router.resolve();
