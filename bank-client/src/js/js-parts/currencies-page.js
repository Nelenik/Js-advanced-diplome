import { el, mount, setChildren } from 'redom';
import { routes } from './actions/_routes';
import { request } from '..';
import { checkSessionState, resetPage, LS } from './actions/_helpers';
import { Select } from './classes/Select';

// let currencyCache = {};

export function currenciesPage(main) {
	checkSessionState();
	resetPage(main);

	const container = el('div.container.exchange', [
		el('h1.exchange__title.title.title--lg', 'Валютный обмен'),
		createCurenciesSkeleton(),
	]);
	mount(main, container);

	updateUserCurrencies();
	updateCourseDynamic();
	request.getAllCurrencies().then((res) => console.log(res));
}
// скелетон страницы "валютный обмен"
function createCurenciesSkeleton() {
	const exchangeBlocks = el('div.exchange__blocks-wrap');
	const userCurrencies = el(
		'div.common-block.common-block--white.exchange__user-currencies.user-currencies',
		el('div.sk.sk-block')
	);
	const courseDynamic = el(
		'div.common-block.common-block--grey.exchange__course-dynamic.course-dynamic',
		el('div.sk.sk-block')
	);
	const convertForm = el(
		'div.common-block.common-block--white.exchange__converter',
		el('div.sk.sk-block')
	);
	exchangeBlocks.append(userCurrencies, courseDynamic, convertForm);
	return exchangeBlocks;
}
// обновление блока "ваши валюты" полученными данными
function updateUserCurrencies() {
	const userCurrenciesBlock = document.querySelector(
		'.exchange__user-currencies'
	);
	request.getUserCurrencies().then((res) => {
		const currencyObjects = Object.values(res);
		const currenciesElems = currencyObjects.map((item) => {
			return el('li.user-currencies__item', [
				el('span.user-currecies__code', item.code),
				el('span.user-currencies__amount', `${item.amount}`),
			]);
		});
		setChildren(userCurrenciesBlock, [
			el('h2.user-currencies__title.title.title--m', 'Ваши валюты'),
			el('ul.user-currencies__list.list-reset', [...currenciesElems]),
		]);
	});
}
// обновление блока "изменение курсов в реальном времени", на базе данных вебсокета
function updateCourseDynamic() {
	const courseDynamicBlock = document.querySelector(
		'.exchange__course-dynamic'
	);
	const itemsFromStorageObj = itemsFromStorage();

	const courseDynamicList = el('ul.course-dynamic__list.list-reset', [
		...Object.values(itemsFromStorageObj),
	]);
	const socket = new WebSocket('ws://localhost:3000/currency-feed');
	socket.addEventListener('open', (e) => {
		setChildren(courseDynamicBlock, [
			el(
				'h2.course-dynamic__title.title.title--m',
				'Изменение курсов в реальном времени'
			),
			courseDynamicList,
		]);
	});
	socket.addEventListener('message', (e) => {
		const data = JSON.parse(e.data);
		if (data.type === 'EXCHANGE_RATE_CHANGE') {
			const classModifier =
				data.change === -1 ? 'down' : data.change === 1 ? 'up' : '';
			const wsConvertPair = `${data.from}/${data.to}`;
			const objToSave = { rate: data.rate, upDownModifier: classModifier };

			if (wsConvertPair in itemsFromStorageObj) {
				const item = itemsFromStorageObj[wsConvertPair];
				item.lastElementChild.textContent = data.rate;
				item.className = itemClassName(classModifier);
			} else {
				const item = createAItem(wsConvertPair, `${data.rate}`, classModifier);
				courseDynamicList.prepend(item);
			}
			if (LS.get('currencyRateCache')) {
				LS.change('currencyRateCache', (saved) => {
					saved[wsConvertPair] = objToSave;
				});
			} else LS.set('currencyRateCache', { [wsConvertPair]: objToSave });
		}
	});
}

// функция создания объекта с элементами, созданными на базе данных из ls
function itemsFromStorage() {
	const cache = LS.get('currencyRateCache');
	if (!cache) return {};
	const itemArr = Object.entries(cache).map(([key, obj]) => {
		const item = createAItem(key, obj.rate, obj.upDownModifier);
		return [key, item];
	});
	return Object.fromEntries(itemArr);
}

// функция создает один элемент списка изменения курса валют
function createAItem(pairStr, rateStr, upDownModifier) {
	const item = el('li', [
		el('span.course-dynamic__pair', pairStr),
		el('span.course-dynamic__rate', rateStr),
	]);
	item.className = itemClassName(upDownModifier);
	return item;
}
// функция формирует className элемента списка изменения курса валют в зависимости от необходимости модификтора
function itemClassName(upDownModifier) {
	const itemClassName =
		upDownModifier && upDownModifier.trim().length > 0
			? `course-dynamic__item course-dynamic__item--${upDownModifier}`
			: `course-dynamic__item `;
	return itemClassName;
}
