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
import { currenciesPage } from './js-parts/currencies-page'; //страница по валютным счетам
import { banksPage } from './js-parts/banks-page'; //страница с банками

export const router = new Navigo(routes.auth);
export const request = new ServerApi('http://localhost:3000');

const appContainer = document.getElementById('bank-app');
//создаем экземпляр хедера. можно исопльзовать один и тот же хедер только включая или выключая меню.
export const headerInstance = new Header({
	appContainer: appContainer,
});

// контейнер со содержимым страницы
const main = el('main.page');
const messageList = el('ul.list-reset.message-block__list');
mount(appContainer, main);
mount(
	document.body,
	el('div.message-block', { id: 'system-message' }, messageList)
);
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
});
// история баланса
router.on(routes.balance, (data) => {
	const id = getIdFromQueryStr(data.queryString);
	balancePage(main, `${id}`);
});
// банки
router.on(routes.banks, () => {
	banksPage(main);
});
// обмен валют
router.on(routes.currencies, () => {
	currenciesPage(main);
});
router.resolve();
