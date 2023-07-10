import '../scss/index.scss';
import { el, mount } from 'redom';
import { default as Navigo } from 'navigo';
import { routes } from './js-parts/actions/_routes'; //маршруты
import { Header } from './js-parts/classes/Header'; // класс хедера
import { ServerApi } from './js-parts/classes/Serverapi'; //класс с методами запросов
import { getIdFromQueryStr, LS } from './js-parts/actions/_helpers';
import { authPage } from './js-parts/auth-page'; //страница авторизации
import { countsPage } from './js-parts/counts-page'; //все счета
import { countInfoPage } from './js-parts/count-info-page'; //информация об одном счете
import { balancePage } from './js-parts/balance-page'; //информация о истории баланса
import { currenciesPage, curencyRateSocket } from './js-parts/currencies-page'; //страница по валютным счетам
import { banksPage } from './js-parts/banks-page'; //страница с банками
// import of svg
import arrowSvg from '!!svg-inline-loader!../img/arrow.svg';

export const router = new Navigo(`${routes.auth}`);
export const request = new ServerApi('http://localhost:3000');

const appContainer = document.getElementById('bank-app');
//создаем экземпляр хедера. можно исопльзовать один и тот же хедер только включая или выключая меню.
export const headerInstance = new Header({
	appContainer: appContainer,
});

// контейнер со содержимым страницы
const main = el('main.page');
export const noticesList = el('ul.list-reset.notices__list', { id: 'notices' });
mount(appContainer, main);
mount(document.body, el('div.notices', noticesList));

/******** РЕГИСТРАЦИЯ МАРШРУТОВ *********/
// авторизация
router.on(routes.auth, () => {
	resetPage(main, false);
	authPage(main);
	sessionStorage.removeItem('token');
});
// список счетов
router.on(routes.accounts, () => {
	checkSessionState();
	resetPage(main);
	countsPage(main);
});
// инфо о счете
router.on(routes.countInfo, (data) => {
	checkSessionState();
	resetPage(main);
	const id = getIdFromQueryStr(data.queryString);
	countInfoPage(main, `${id}`, createTitleRow);
});
// история баланса
router.on(routes.balance, (data) => {
	checkSessionState();
	resetPage(main);
	const id = getIdFromQueryStr(data.queryString);
	balancePage(main, `${id}`, createTitleRow);
});
// банки
router.on(routes.banks, () => {
	checkSessionState();
	resetPage(main);
	banksPage(main);
});
// обмен валют
router.on(routes.currencies, () => {
	checkSessionState();
	resetPage(main);
	currenciesPage(main);
});
router.resolve();

// навигация при первой загрузке страницы(без этого не работает prod-версия)
// router.navigate(`${routes.auth}`);

/***************НЕКОТОРЫЕ ОБЩИЕ ФУНКЦИИ***********/
/******(из helpers убрала из-за циклической зависимости, что мешала тестам)*********/

/*функция проверяет наличие токена с session storage и перенаправляет на страницу авторизации если токена нет*/
function checkSessionState() {
	const token = sessionStorage.getItem('token');
	if (!token) {
		alert('Время сессии истекло!');
		router.navigate(routes.auth);
	}
}

/*******************************************************/
/*функция очищает main перед рендерингом каждой страницы, очищает интервал запроса данных, который запускается на странице счета, и очищает в хранилище "countDataRequestTimeout" закрывает канал сокета*/
function resetPage(main, turnOnMenu = true) {
	main.innerHTML = '';
	headerInstance.enableMenu = turnOnMenu;
	const key = 'countDataRequestTimeout';
	const timeoutId = LS.get(key);
	if (timeoutId) clearTimeout(timeoutId);
	LS.remove(key);
	if (curencyRateSocket) curencyRateSocket.close();
}

/*******************************************************/
/*функция создания строки с заголовком и кнопкой назад на страницах "посмотр счета" и "история баланса", т.к. они одинаковые на этих 2 страницах, принимает: pageClass(имя блока к которому относится, в нашем случае блоком является имя страницы), pageTitle(строка, название страницы), backRoute(путь для ссылки назад*/
export function createTitleRow(pageClass, pageTitle, backRoute) {
	const backLink = el(
		`a.link-reset.blue-btn.blue-btn--back.${pageClass}__back-link`,
		{
			href: `${backRoute}`,
		}
	);
	backLink.innerHTML = `${arrowSvg} Вернуться назад`;
	backLink.addEventListener('click', (e) => {
		e.preventDefault();
		router.navigate(`${backRoute}`);
		headerInstance.switchActiveLinkState(backRoute);
	});

	return el(`div.${pageClass}__title-row`, [
		el(`h1.${pageClass}__title.title.title--lg`, `${pageTitle}`),
		backLink,
	]);
}
