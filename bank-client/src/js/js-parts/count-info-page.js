import { el, mount, setChildren } from 'redom';
import { routes } from './actions/_routes';
import { request, router } from '..';
import { Select } from './classes/Select';
import {
	BalancePerPeriod,
	redirectOnExipredSession,
	sortByStr,
	wait,
	LS,
	resetPage,
} from './actions/_helpers';
import { Table } from './classes/Table';
// import of svg
import mailSvg from '!!svg-inline-loader!../../img/mail.svg';
import arrowSvg from '!!svg-inline-loader!../../img/arrow.svg';

export function countInfoPage(main, countId) {
	resetPage(main);

	const container = el('div.container.count-info', [
		createTitleRow(),
		...createPageSkeleton(),
	]);
	mount(main, container);
	getHistoryData(countId, updateDynamicBlocks, updateStaticBlocks);
	let intervalId = setInterval(() => {
		getHistoryData(countId, updateDynamicBlocks);
	}, 60000);
	LS.set('countDataRequestInterval', intervalId);
}

// действия с результатом запроса
function getHistoryData(countId, dynamicFunc, staticFunc) {
	request
		.getCountInfo(countId)
		.then((res) => {
			if (dynamicFunc) dynamicFunc(res);
			if (staticFunc) staticFunc(res);
		})
		.catch((err) => {
			redirectOnExipredSession(err.message);

			if (/^нет\sданных?/i.test(err.message)) {
				console.log('Данные по счету отсутствуют');
			}
		});
}

// блок заголовка страницы и кнопки назад
function createTitleRow() {
	const backLink = el('a.link-reset.blue-btn.count-info__back-link', {
		href: `${routes.accounts}`,
	});
	backLink.innerHTML = `${arrowSvg} Вернуться назад`;
	backLink.addEventListener('click', (e) => {
		e.preventDefault();
		router.navigate(`${routes.accounts}`);
	});

	return el('div.count-info__title-row', [
		el('h1.count-info__title.title.title--lg', 'Просмотр счета'),
		backLink,
	]);
}

// скелет данной страницы
function createPageSkeleton() {
	const countNum = el(
		'h2.count-info__num',
		{ 'data-count': '' },
		el('div.sk.sk-text.sk-text--75')
	);
	const balance = el('p.count-info__balance.balance', { 'data-balance': '' }, [
		el('span.sk.sk-text.sk-text--50'),
		el('span.sk.sk-text.sk-text--50'),
	]);
	const balanceRow = el('div.count-info__balance-row', [countNum, balance]);

	const transactionBlock = el(
		'div.count-info__transaction-wrap.transaction',
		{ 'data-trans-block': '' },
		el('div.sk.sk-block')
	);
	const dynamicBlock = el(
		'div.count-info__dynamic-wrap',
		{ 'data-count-dynamic': '' },
		el('div.sk.sk-block')
	);
	const historyBlock = el(
		'div.count-info__history-wrap',
		{ 'data-count-history': '' },
		el('div.sk.sk-block')
	);

	return [balanceRow, transactionBlock, dynamicBlock, historyBlock];
}

/*****ОБНОВЛЕНИЕ БЛОКОВ ПРИШЕДШИМИ ДАННЫМИ******/
// функция обновления статических блоков: форма транзакций и номер счета
function updateStaticBlocks(res) {
	const container = document.querySelector('.count-info');
	const countNum = container.querySelector('[data-count]');
	const transactionBlock = container.querySelector('[data-trans-block]');
	// номер счета
	countNum.textContent = `№ ${res.account}`;
	// форма транзакций
	transactionBlock.innerHTML = '';
	setChildren(transactionBlock, [
		el('h2.transaction__title.title.title--m', 'Новый перевод'),
		createTransferForm(res.account),
	]);
}
// функция обновления динамических блоков:баланс, история переводов, динамика транзакций
function updateDynamicBlocks(res) {
	const container = document.querySelector('.count-info');
	const balance = container.querySelector('[data-balance]');
	const historyBlock = container.querySelector('[data-count-history]');
	const dynamicBlock = container.querySelector('[data-count-dynamic]');

	// замена скелета строки с балансом
	balance.innerHTML = `
  <span class="balance__text">Баланс</span>
  <span class="balance__value">${res.balance} ₽</span>
  `;

	//замена скелета блока история транзакций
	const lastTenTransactions = res.transactions.reverse().slice(0, 10);
	const historyTable = new Table(res.account, lastTenTransactions);
	setChildren(historyBlock, [
		el('h2.history__title.title.title--m', 'История переводов'),
		historyTable.table,
	]);

	const balancePerPeriod = new BalancePerPeriod(res, 5);
	const transPerMonth = balancePerPeriod.arrangeBalanceData();
	console.log(transPerMonth);
}

// функция создает форму переводов
function createTransferForm(countId) {
	const form = el('form.count-info__trans-form.transaction', {
		name: 'transForm',
		autocomplete: 'off',
	});
	const countNumField = new Select({
		triggerType: 'text',
		additionalClass: 'transaction__select-field',
		placeholderText: 'Счет получателя',
		onInput: (select, value) => {
			wait(300).then(() => {
				let savedCounts = LS.get('savedCounts');
				if (!savedCounts) return;
				savedCounts.sort(sortByStr(value));
				const selectContent = savedCounts.map((item) => ({
					text: item,
					value: item,
					name: 'counts',
				}));
				select.selectContent = selectContent;
				select.isOpen = true;
			});
		},
	});
	countNumField.autocompleteInput.name = 'transSelect';
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
			countNumField.select,
		]),
		el('label.transaction__field-wrap', [
			el('span', 'Сумма перевода'),
			amountField,
		]),
		transSbmtBtn,
	]);

	form.addEventListener('submit', formSbmtHandler(countId, countNumField));

	return form;
}

// обработчик сабмита формы отправки переводов
function formSbmtHandler(countId) {
	return function (e) {
		e.preventDefault();
		if (document.activeElement == e.target.transSelect) return; //предотвращает отправку формы при выборе enter-ом значения в кастомном селекте

		const targetCountValue = e.target.transSelect.value;
		const amountValue = e.target.transAmount.value;
		if (targetCountValue.length > 10) {
			if (LS.get('savedCounts')) {
				LS.change('savedCounts', (saved) => {
					if (!saved.includes(targetCountValue)) saved.push(targetCountValue);
				});
			} else {
				LS.set('savedCounts', [targetCountValue]);
			}
		}
		request
			.sendTransfer({
				from: countId,
				to: targetCountValue,
				amount: amountValue,
			})
			.then((res) => {
				updateDynamicBlocks(res);
			})
			.catch((err) => console.log(err))
			.finally(() => {
				e.target.reset();
			});
	};
}
