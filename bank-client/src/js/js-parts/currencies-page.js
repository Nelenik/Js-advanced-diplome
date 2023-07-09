import { el, mount, setChildren } from 'redom';
import { request, noticesList } from '..';
import { LS, Validate, systemMessage } from './actions/_helpers';
import { Select } from './classes/Select';

export let curencyRateSocket;
export function currenciesPage(main) {
	const container = el('div.container.exchange', [
		el('h1.exchange__title.title.title--lg', 'Валютный обмен'),
		createCurenciesSkeleton(),
	]);
	mount(main, container);

	request.getUserCurrencies().then((res) => {
		updateUserCurrencies(res);
	});
	updateCourseDynamic();
	updateConverter();
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
		'div.common-block.common-block--white.exchange__converter.converter',
		el('div.sk.sk-block')
	);
	exchangeBlocks.append(userCurrencies, courseDynamic, convertForm);
	return exchangeBlocks;
}
/************обновление блока "ваши валюты" полученными данными***********/
function updateUserCurrencies(res) {
	const userCurrenciesBlock = document.querySelector(
		'.exchange__user-currencies'
	);
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
}
/************обновление блока "изменение курсов в реальном времени", на базе данных вебсокета*******************/
function updateCourseDynamic() {
	const courseDynamicBlock = document.querySelector(
		'.exchange__course-dynamic'
	);
	const itemsFromStorageObj = itemsFromStorage();

	const courseDynamicList = el('ul.course-dynamic__list.list-reset', [
		...Object.values(itemsFromStorageObj),
	]);
	curencyRateSocket = new WebSocket('ws://localhost:3000/currency-feed');
	curencyRateSocket.addEventListener('open', () => {
		setChildren(courseDynamicBlock, [
			el(
				'h2.course-dynamic__title.title.title--m',
				'Изменение курсов в реальном времени'
			),
			courseDynamicList,
		]);
	});
	curencyRateSocket.addEventListener('message', (e) => {
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

// функция создания объекта с элементами, созданными на базе сохраненных в ls курсах валют
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

/*****************обновление блока "обмен валюты"***********/
let converterSummValid;
async function updateConverter() {
	const converterBlock = document.querySelector('.exchange__converter');
	const allCurrencies = await request.getAllCurrencies();
	const fromSelectContent = allCurrencies.map((item) => {
		return {
			text: `${item}`,
			value: `${item}`,
			name: 'convertFrom',
			selected: item === 'RUB' ? true : false,
		};
	});
	const toSelectContent = allCurrencies.map((item) => {
		return {
			text: `${item}`,
			value: `${item}`,
			name: 'convertFrom',
			selected: item === 'USD' ? true : false,
		};
	});
	const fromSelect = new Select({
		selectContent: fromSelectContent,
		additionalClass: 'converter__select-from',
	});
	const toSelect = new Select({
		selectContent: toSelectContent,
		additionalClass: 'converter__select-to',
	});

	const converterForm = el('form.converter__form', { name: 'converterForm' }, [
		el('label.converter__select-label', [
			el('span.converter__select-text', 'Из'),
			fromSelect.select,
		]),
		el('label.converter__select-label', [
			el('span.converter__select-text', 'в'),
			toSelect.select,
		]),
		el('label.converter__summ-label', [
			'Сумма',
			el('input.converter__summ-input', {
				type: 'text',
				name: 'converterSumm',
			}),
		]),
		el(
			'button.converter__convert-btn.btn-reset.blue-btn',
			{ type: 'submit' },
			'Обменять'
		),
	]);

	setChildren(converterBlock, [
		el('h2.converter__title.title.title--m', 'Обмен валюты'),
		converterForm,
	]);

	converterSummValid = new Validate(converterForm.converterSumm, [
		{ name: 'required', message: 'Это поле обязательно' },
		{ name: 'positive', message: 'Введите положительное значение' },
	]);

	converterForm.addEventListener(
		'submit',
		convertFormHandler(fromSelect, toSelect)
	);
}
// обработчик формы конвертации
function convertFormHandler(selectFrom, selectTo) {
	return function (e) {
		e.preventDefault();
		if (document.activeElement == e.target.selectTriggerBtn) return;
		// валидация поля
		converterSummValid.validate();
		if (!converterSummValid.success) return;
		// после успешной валидации
		const objToPost = {
			from: selectFrom.selectValue,
			to: selectTo.selectValue,
			amount: e.target.converterSumm.value,
		};
		request
			.convert(objToPost)
			.then((res) => updateUserCurrencies(res))
			.catch((err) => {
				switch (err.message) {
					case 'Invalid amount':
						noticesList.prepend(
							systemMessage(
								'Не указана сумма перевода, или она отрицательная',
								'warning'
							)
						);
						break;
					case 'Not enough currency':
						noticesList.prepend(
							systemMessage('На валютном счёте списания нет средств', 'warning')
						);
						break;
					case 'Overdraft prevented':
						noticesList.prepend(
							systemMessage(
								'Попытка перевести больше, чем доступно на счёте списания',
								'warning'
							)
						);
						break;
					case 'Unknown currency code':
						noticesList.prepend(
							systemMessage(
								'Передан неверный валютный код, код не поддерживается системой',
								'warning'
							)
						);
						break;
					default:
						throw err;
				}
			})
			.finally(() => {
				e.target.reset();
			});
	};
}
