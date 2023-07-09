import { el, mount, setChildren } from 'redom';
import { routes } from './actions/_routes';
import { request } from '..';
import { BalancePerPeriod } from './actions/_helpers';
import { Table } from './classes/Table';
import {
	setBalanceDynamicChart,
	setTransactionsRatioChart,
} from './actions/_charts';
import { Pagination } from './classes/Pagination';

export function balancePage(main, countId, createTitleRow) {
	const container = el('div.container.balance-page', [
		createTitleRow(
			'balance-page',
			'История баланса',
			`${routes.countInfo}?id=${countId}`
		),
		createBalancePageSkeleton(),
	]);
	mount(main, container);
	fetchBalanceData(countId);
}
// скелетон balance page
function createBalancePageSkeleton() {
	const fragment = document.createDocumentFragment();
	const countNum = el(
		'h2.balance-page__num.count-num',
		el('div.sk.sk-text.sk-text--75')
	);
	const balance = el('p.balance-page__balance.balance', [
		el('span.sk.sk-text.sk-text--50'),
		el('span.sk.sk-text.sk-text--50'),
	]);
	const balanceRow = el('div.balance-page__balance-row', [countNum, balance]);

	const dinamycChart = el(
		'div.common-block.common-block--white.balance-page__chart-block.dynamic-chart',
		el('div.sk.sk-block')
	);
	const ratioChart = el(
		'div.common-block.common-block--white.balance-page__chart-block.ratio-chart',
		el('div.sk.sk-block')
	);
	const historyBlock = el(
		'div.common-block.common-block--grey.balance-page__history-block.history',
		el('div.sk.sk-block')
	);

	fragment.append(balanceRow, dinamycChart, ratioChart, historyBlock);
	return fragment;
}
// фнукции обновления блоков на странице balance-page
const balanceUpdateBlocks = {
	updateBalance: (container, res) => {
		const balance = container.querySelector('.balance-page__balance');
		balance.innerHTML = `
  <span class="balance__text">Баланс</span>
  <span class="balance__value">${res.balance.toFixed(2)} ₽</span>
  `;
	},
	updateCountNum: (container, res) => {
		// номер счета
		const countNum = container.querySelector('.balance-page__num');
		countNum.textContent = `№ ${res.account}`;
	},
	updateHistoryBlock: (container, res) => {
		const historyBlock = container.querySelector(
			'.balance-page__history-block'
		);
		const tableWrapper = el('div.balance-page__table-wrap');
		const transactionsDublicate = JSON.parse(
			JSON.stringify(res.transactions)
		).reverse();
		const pas = 25;
		const pagesCount = Math.ceil(transactionsDublicate.length / pas);
		const table = new Table(res.account, transactionsDublicate.slice(0, pas));
		mount(tableWrapper, table.table);
		new Pagination(tableWrapper, {
			pages: pagesCount,
			ellipsis: true,
			onClick: (num) => {
				const start = (num - 1) * pas;
				const end = start + pas;
				table.tableData = transactionsDublicate.slice(start, end);
			},
			controls: {
				startEnd: {
					enable: true,
					startInner: 'First',
					endInner: 'Last',
				},
				prevNext: {
					enable: true,
					prevInner: 'ᐸ',
					nextInner: 'ᐳ',
				},
			},
		});
		setChildren(historyBlock, [
			el('h2.history__title.title.title--m', 'История переводов'),
			tableWrapper,
		]);
	},
	updateDynamicChart: (container, chartData) => {
		const dynamicChartBlock = container.querySelector('.dynamic-chart');
		const canvas = el('canvas', { id: 'balancePageDynamic' });
		setChildren(dynamicChartBlock, [
			el('h2.dynamic-chart__title.title.title--m', 'Динамика баланса'),
			el('div.dynamic-chart__wrap.chart', canvas),
		]);
		setBalanceDynamicChart(canvas, chartData);
	},
	updateRatioChart: (container, chartData) => {
		const ratioChart = container.querySelector('.ratio-chart');
		const canvas = el('canvas', { id: 'balancePageRatio' });
		setChildren(ratioChart, [
			el(
				'h2.ratio-chart__title.title.title--m',
				'Соотношение входящих исходящих транзакций'
			),
			el('div.ratio-chart__wrap.chart', canvas),
		]);
		setTransactionsRatioChart(canvas, chartData);
	},
};
// обновление блоков на странице по запросу
function fetchBalanceData(countId) {
	request
		.getCountInfo(countId)
		.then((res) => {
			const {
				updateBalance,
				updateCountNum,
				updateHistoryBlock,
				updateDynamicChart,
				updateRatioChart,
			} = balanceUpdateBlocks;
			const container = document.querySelector('.balance-page');
			const chartDataInst = new BalancePerPeriod(res, 11);
			const chartDataArr = chartDataInst.arrangeBalanceData();
			updateBalance(container, res);
			updateCountNum(container, res);
			updateHistoryBlock(container, res);
			updateDynamicChart(container, chartDataArr);
			updateRatioChart(container, chartDataArr);
		})
		.catch((err) => {
			console.log(err);
		});
}
