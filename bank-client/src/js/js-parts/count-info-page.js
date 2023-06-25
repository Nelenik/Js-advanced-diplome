import { el, mount, setChildren } from 'redom';
import { routes } from './actions/_routes';
import { request, router } from '..';
import { Select } from './classes/Select';
import {
	BalancePerPeriod,
	checkSessionState,
	sortByStr,
	wait,
	LS,
	resetPage,
	createTitleRow,
} from './actions/_helpers';
import { Table } from './classes/Table';
import { setBalanceDynamicChart } from './actions/_charts';
// import of svg
import mailSvg from '!!svg-inline-loader!../../img/mail.svg';

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
			// redirectOnExipredSession(err.message);

			if (/^нет\sданных?/i.test(err.message)) {
				console.log('Данные по счету отсутствуют');
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
		setChildren(historyBlock, [
			el(
				'h2.history__title.title.title--m',
				el(
					'a.history__link.link-reset',
					{ href: href, 'data-navigo': '' },
					'История переводов'
				)
			),
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
		setChildren(chartBlock, [
			el(
				'h2.chart-block__title.title.title--m',
				el(
					'a.chart-block__link.link-reset',
					{ href: href, 'data-navigo': '' },
					'Динамика баланса'
				)
			),
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
// функция обновления статических блоков: форма транзакций и номер счета
function updateStaticBlocks(res) {
	const container = document.querySelector('.count-info');
	const { updateCountNum, updateTransactionBlock } = updateBlocks;
	updateCountNum(container, res);
	updateTransactionBlock(container, res);
}
// функция обновления динамических блоков:баланс, история переводов, динамика транзакций
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
	const countNumField = new Select({
		triggerType: 'text',
		additionalClass: 'transaction__select-field',
		placeholderText: 'Счет получателя',
		onInput: (select, value) => {
			wait(300).then(() => {
				// получаем из хранилища сохраненные счета, фильтруем по строке и сортируем по значению
				let savedCounts = LS.get('savedCounts');
				if (!savedCounts) return;
				const filteredCounts = savedCounts.filter((item) =>
					item.startsWith(value)
				);
				filteredCounts.sort(sortByStr(value));
				// если в поле ввода что то есть и в отфильтрованный массив счетов не пуст то открываем дропдаун, в противном случае сбрасываем селект
				if (value.length > 0) {
					const selectContent = filteredCounts.map((item) => ({
						text: item,
						value: item,
						name: 'counts',
					}));
					select.selectContent = selectContent;
					if (filteredCounts.length > 0) select.isOpen = true;
				} else {
					select.isOpen = false;
					select.reset();
				}
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
