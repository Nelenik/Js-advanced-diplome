import { el, mount, setChildren } from 'redom';
import { getCreditCardNameByNumber } from 'creditcard.js';
import { routes } from './actions/_routes';
import { request, router, noticesList } from '..';
import { Select } from './classes/Select';
import {
	BalancePerPeriod,
	checkSessionState,
	sortByStr,
	wait,
	LS,
	resetPage,
	createTitleRow,
	systemMessage,
	Validate,
} from './actions/_helpers';
import { Table } from './classes/Table';
import { setBalanceDynamicChart } from './actions/_charts';
// import of svg
import mailSvg from '!!svg-inline-loader!../../img/mail.svg';
//import cardimages
import amex from '../../img/card-brands/Amex.png';
import aura from '../../img/card-brands/Aura.png';
import banescard from '../../img/card-brands/Banescard.png';
import cabal from '../../img/card-brands/Cabal.png';
import diners from '../../img/card-brands/Diners.png';
import discover from '../../img/card-brands/Discover.png';
import elo from '../../img/card-brands/Elo.png';
import goodcard from '../../img/card-brands/Goodcard.png';
import hipercard from '../../img/card-brands/Hipercard.png';
import mastercard from '../../img/card-brands/Mastercard.png';
import maxxvan from '../../img/card-brands/Maxxvan.png';
import visa from '../../img/card-brands/Visa.png';
const creditCardsImages = [
	amex,
	aura,
	banescard,
	cabal,
	diners,
	discover,
	elo,
	goodcard,
	hipercard,
	mastercard,
	maxxvan,
	visa,
];

// здесь сохраняются экземпляры Validate
let transfFromValid;
let transfAmountValid;

/**********ГЛАВНАЯ ФУНКЦИЯ СТРАНИЦЫ COUNT-INFO************/
export function countInfoPage(main, countId) {
	checkSessionState();
	resetPage(main);

	const container = el('div.container.count-info', [
		createTitleRow('count-info', 'Просмотр счета', routes.accounts),
		createPageSkeleton(),
	]);
	mount(main, container);
	fetchHistoryData(countId, updateDynamicBlocks, updateStaticBlocks);
}

// действия с результатом запроса
function fetchHistoryData(countId, dynamicFunc, staticFunc) {
	request
		.getCountInfo(countId)
		.then((res) => {
			if (dynamicFunc) dynamicFunc(res);
			if (staticFunc) staticFunc(res);
		})
		.catch((err) => {
			switch (err.message) {
				case 'Нет данных':
					noticesList.prepend(
						systemMessage('Данные по счету отсутствуют', 'warning')
					);
			}
		})
		.finally(() => {
			let timeoutId = setTimeout(() => {
				fetchHistoryData(countId, dynamicFunc);
			}, 30000);
			LS.set('countDataRequestTimeout', timeoutId);
		});
}

// скелет данной страницы
function createPageSkeleton() {
	const fragment = document.createDocumentFragment();
	const countNum = el(
		'h2.count-info__num.count-num',
		el('div.sk.sk-text.sk-text--75')
	);
	const balance = el('p.count-info__balance.balance', [
		el('span.sk.sk-text.sk-text--50'),
		el('span.sk.sk-text.sk-text--50'),
	]);
	const balanceRow = el('div.count-info__balance-row', [countNum, balance]);

	const transactionBlock = el(
		'div.common-block.common-block--grey.count-info__transaction.transaction',
		el('div.sk.sk-block')
	);
	const chartBlock = el(
		'div.common-block.common-block--white.count-info__chart-block.chart-block',
		el('div.sk.sk-block')
	);
	const historyBlock = el(
		'div.common-block.common-block--grey.count-info__history.history',
		el('div.sk.sk-block')
	);
	fragment.append(balanceRow, transactionBlock, chartBlock, historyBlock);
	return fragment;
}

/*****************ОБНОВЛЕНИЕ СКЕЛЕТА****************************/

// объект с функциями по замене скелета данными запроса
const updateBlocks = {
	updateBalance: (container, res) => {
		// замена скелета строки с балансом
		const balance = container.querySelector('.count-info__balance');
		balance.innerHTML = `
  <span class="balance__text">Баланс</span>
  <span class="balance__value">${res.balance.toFixed(2)} ₽</span>
  `;
	},
	updateHistoryBlock: (container, res, href) => {
		const historyBlock = container.querySelector('.count-info__history');
		//замена скелета блока история транзакций
		const transactionsDublicate = JSON.parse(JSON.stringify(res.transactions)); //делаем копию, т.к. reverse влияет на исходный массив
		const lastTenTransactions = transactionsDublicate.reverse().slice(0, 10);
		const historyTable = new Table(res.account, lastTenTransactions);
		const historyLink = el(
			'a.history__link.link-reset',
			{ href: href },
			'История переводов'
		);
		historyLink.addEventListener('click', (e) => {
			e.preventDefault();
			router.navigate(href);
		});
		setChildren(historyBlock, [
			el('h2.history__title.title.title--m', historyLink),
			historyTable.table,
		]);
	},
	updateChartBlock: (container, res, href) => {
		const chartBlock = container.querySelector('.count-info__chart-block');
		//замена блока с диаграммой
		// преобразуем исходный массив с транзакциями в нужную нам структуру и активируем диаграмму
		const balancePerPeriod = new BalancePerPeriod(res, 5);
		const transPerMonth = balancePerPeriod.arrangeBalanceData();
		const canvas = el('canvas', { id: 'countInfoBalanceChart' });
		const chartBlockLink = el(
			'a.chart-block__link.link-reset',
			{ href: href },
			'Динамика баланса'
		);
		chartBlockLink.addEventListener('click', (e) => {
			e.preventDefault();
			router.navigate(href);
		});
		setChildren(chartBlock, [
			el('h2.chart-block__title.title.title--m', chartBlockLink),
			el('div.chart-block__canvas-wrap.chart', canvas),
		]);
		setBalanceDynamicChart(canvas, transPerMonth);
	},
	updateCountNum: (container, res) => {
		// номер счета
		const countNum = container.querySelector('.count-info__num');
		countNum.textContent = `№ ${res.account}`;
	},
	updateTransactionBlock: (container, res) => {
		// форма переводов
		const transactionBlock = container.querySelector(
			'.count-info__transaction'
		);
		transactionBlock.innerHTML = '';
		setChildren(transactionBlock, [
			el('h2.transaction__title.title.title--m', 'Новый перевод'),
			createTransferForm(res.account),
		]);
	},
};
// функция обновления статических блоков: форма транзакций и номер счета. Обновляются один раз при получении данных
function updateStaticBlocks(res) {
	const container = document.querySelector('.count-info');
	const { updateCountNum, updateTransactionBlock } = updateBlocks;
	updateCountNum(container, res);
	updateTransactionBlock(container, res);
}
// функция обновления динамических блоков:баланс, история переводов, динамика транзакций. Обновляются каждые 30 сек повторным запросом
function updateDynamicBlocks(res) {
	const { updateBalance, updateChartBlock, updateHistoryBlock } = updateBlocks;
	const container = document.querySelector('.count-info');
	const href = `${routes.balance}?id=${res.account}`;
	updateBalance(container, res);
	updateChartBlock(container, res, href);
	updateHistoryBlock(container, res, href);
}

// функция создает форму переводов
function createTransferForm(countId) {
	const form = el('form.count-info__trans-form.transaction', {
		name: 'transForm',
		autocomplete: 'off',
	});
	const transToSelect = new Select({
		triggerType: 'text',
		additionalClass: 'transaction__select-field',
		placeholderText: 'Счет получателя',
		onInput: selectOnInput,
		onValueChange: selectOnValueChange,
	});
	transToSelect.autocompleteInput.name = 'transSelect';
	const amountField = el('input.transaction__amount-field', {
		placeholder: 'Сумма перевода',
		type: 'number',
		name: 'transAmount',
	});
	const transSbmtBtn = el('button.btn-reset.transaction__sbmt-btn', {
		type: 'submit',
	});
	transSbmtBtn.innerHTML = `${mailSvg} Отправить`;

	setChildren(form, [
		el('label.transaction__field-wrap', [
			el('span', 'Номер счёта получателя'),
			transToSelect.select,
		]),
		el('label.transaction__field-wrap', [
			el('span', 'Сумма перевода'),
			amountField,
		]),
		transSbmtBtn,
	]);

	form.addEventListener('submit', formSbmtHandler(countId));
	// инициализируем валидацию полей
	transfFromValid = new Validate(form.transSelect, [
		{ name: 'required', message: 'Это поле обязательно' },
		{
			name: 'minLength',
			minLength: 10,
			message: 'Номер счета минимум 10 символов',
		},
	]);
	transfAmountValid = new Validate(amountField, [
		{ name: 'required', message: 'Это поле обязательно' },
		{ name: 'positive', message: 'Введите положительное значение' },
	]);

	return form;
}

//колбэк selectOnInput используется при инициализации Select-а "номер счета получателя" в блоке транзакции, настраивает автодополнение
function selectOnInput(selectInst, value) {
	wait(300).then(() => {
		// получаем из хранилища сохраненные счета, фильтруем по строке и сортируем по значению
		let savedCounts = LS.get('savedCounts');
		if (!savedCounts) return;
		const filteredCounts = savedCounts.filter((item) => item.startsWith(value));
		filteredCounts.sort(sortByStr(value));
		// если в поле ввода что то есть и отфильтрованный массив счетов не пуст то открываем дропдаун, в противном случае сбрасываем селект
		if (value.length > 0) {
			const selectContent = filteredCounts.map((item) => ({
				text: item,
				value: item,
				name: 'counts',
			}));
			selectInst.selectContent = selectContent;
			if (filteredCounts.length > 0) selectInst.isOpen = true;
			else selectInst.isOpen = false;
		} else {
			selectInst.isOpen = false;
			selectInst.reset();
		}
	});
}
// колбэк selectOnValueChange используется при инциализации Select-a, настраивает показ изображения платежной системы
function selectOnValueChange(selectInst, value) {
	const selectWrap = selectInst.select.parentElement;
	removeCardImg();
	let cardType = getCreditCardNameByNumber(value);
	if (cardType === 'Credit card is invalid!') return;
	console.log(cardType);
	const cardReg = new RegExp(cardType);
	const src = creditCardsImages.find((src) => cardReg.test(src));
	mount(
		selectWrap,
		el('img.pay-system-img', {
			id: 'paySystImg',
			alt: `Изображение платежной системы ${cardType}`,
			src: src,
		})
	);
}

// обработчик сабмита формы отправки переводов
function formSbmtHandler(countId) {
	return function (e) {
		e.preventDefault();
		if (document.activeElement == e.target.transSelect) return; //предотвращает отправку формы при выборе enter-ом значения в кастомном селекте
		// валидируем поля
		transfFromValid.validate();
		transfAmountValid.validate();
		if (!transfFromValid.success || !transfAmountValid.success) return;
		// при успешной валидации выполняем нужные действия
		const transfToValue = e.target.transSelect.value;
		const amountValue = e.target.transAmount.value;
		if (LS.get('savedCounts')) {
			LS.change('savedCounts', (saved) => {
				if (!saved.includes(transfToValue)) saved.push(transfToValue);
			});
		} else {
			LS.set('savedCounts', [transfToValue]);
		}
		request
			.sendTransfer({
				from: countId,
				to: transfToValue,
				amount: amountValue,
			})
			.then((res) => {
				updateDynamicBlocks(res);
			})
			.catch((err) => {
				switch (err.message) {
					case 'Invalid account to':
						noticesList.prepend(
							systemMessage(
								'Не указан счёт зачисления, или этого счёта не существует',
								'warning'
							)
						);
						break;
					case 'Invalid amount':
						noticesList.prepend(
							systemMessage(
								'Не указана сумма перевода, или она отрицательная',
								'warning'
							)
						);
						break;
					case 'Overdraft prevented':
						noticesList.prepend(
							systemMessage(
								'Вы пытаетесь перевести больше чем доступно на счете списания',
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
				removeCardImg();
			});
	};
}
// удаляет изображение платежной системы
function removeCardImg() {
	const paySystImg = document.getElementById('paySystImg');
	paySystImg?.remove();
}
