import '../index.html';
import '../scss/index.scss';
import Navigo from 'navigo';
import { el, mount } from 'redom';
import { routes } from './js-parts/actions/_routes'; //маршруты
import { getIdFromQueryStr } from './js-parts/actions/_helpers';
import { ServerApi } from './js-parts/classes/Serverapi'; //класс с методами запросов
import { Header } from './js-parts/classes/Header'; // класс хедера
import { authPage } from './js-parts/auth-page'; //страница авторизации
import { countsPage } from './js-parts/counts-page'; //все счета
import { countInfoPage } from './js-parts/count-info-page'; //информация об одном счете
import { balancePage } from './js-parts/balance-page'; //информация о истории баланса

export const router = new Navigo(routes.auth);
export const request = new ServerApi('http://localhost:3000');

const appContainer = document.getElementById('bank-app');
//создаем экземпляр хедера. можно исопльзовать один и тот же хедер только включая или выключая меню.
export const headerInstance = new Header({
	appContainer: appContainer,
});

// контейнер со содержимым страницы
const main = el('main.page');
mount(appContainer, main);

// регистрируем роутеры

// авторизация
router.on(routes.auth, () => {
	authPage(main);
	sessionStorage.removeItem('token');
});
// список счетов
router.on(routes.accounts, () => {
	countsPage(main);
});
// инфо о счете
router.on(routes.countInfo, (data) => {
	const id = getIdFromQueryStr(data.queryString);
	countInfoPage(main, `${id}`);
	Header.mainMenuLinks.forEach((link) =>
		link.classList.remove('header__link--active')
	);
});
// история баланса
router.on(routes.balance, (data) => {
	const id = getIdFromQueryStr(data.queryString);
	balancePage(main, `${id}`);
	Header.mainMenuLinks.forEach((link) =>
		link.classList.remove('header__link--active')
	);
});
// банки
router.on(routes.banks, () => {
	main.innerHTML = '';
	headerInstance.enableMenu = true;
});
// обмен валют
router.on(routes.currencies, () => {
	main.innerHTML = '';
	headerInstance.enableMenu = true;
});
router.resolve();
