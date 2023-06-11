import { el, mount, setChildren } from 'redom';
import { routes } from './_routes';
import { request, router } from '..';
import { Select } from './Select';
import { BalancePerPeriod, redirectOnExipredSession } from './_helpers';

export function countInfoPage(main, headerInstance, countId) {
	main.innerHTML = '';
	headerInstance.enableMenu = true;

	const {
		countNum,
		balance,
		balanceRow,
		transactionBlock,
		dynamicBlock,
		historyBlock,
	} = createPageSkeleton();

	const container = el('div.container.count-info', [
		createTitleRow(),
		balanceRow,
		transactionBlock,
		dynamicBlock,
		historyBlock,
	]);
	getHistoryData(countId, {
		countNum,
		balance,
		transactionBlock,
		dynamicBlock,
		historyBlock,
	});
	// setInterval(() => {
	// 	getHistoryData(countId, {
	// 		countNum,
	// 		balance,
	// 		transactionBlock,
	// 		dynamicBlock,
	// 		historyBlock,
	// 	});
	// }, 20000);
	mount(main, container);
}
// строка заголовка
function createTitleRow() {
	const backLink = el(
		'a.link-reset.blue-btn.count-info__back-link',
		{ href: `${routes.accounts}` },
		'Вернуться назад'
	);
	backLink.addEventListener('click', (e) => {
		e.preventDefault();
		router.navigate(`${routes.accounts}`);
	});

	return el('div.count-info__title-row', [
		el('h1.count-info__title.title', 'Просмотр счета'),
		backLink,
	]);
}
// скелет данной страницы
function createPageSkeleton() {
	const countNum = el('h2.count-info__num', el('div.sk.sk-text'));
	const balance = el('p.count-info__balance.balance', [
		el('span.sk.sk-text.sk-text--50'),
		el('span.sk.sk-text.sk-text--50'),
	]);
	const balanceRow = el('div.count-info__balance-row', [countNum, balance]);

	const transactionBlock = el(
		'div.count-info__transaction-wrap',
		el('div.sk.sk-block')
	);
	const dynamicBlock = el(
		'div.count-info__dynamic-wrap',
		el('div.sk.sk-block')
	);
	const historyBlock = el(
		'div.count-info__history-wrap',
		el('div.sk.sk-block')
	);

	return {
		countNum,
		balance,
		balanceRow,
		transactionBlock,
		dynamicBlock,
		historyBlock,
	};
}
// форма переводов
function createTransferForm() {
  const form = el('form.count-info');
  const
}

// действия с результатом запроса
function getHistoryData(countId, toModificate) {
	request
		.getCountInfo(countId)
		.then((res) => {
			const {
				countNum,
				balance,
				transactionBlock,
				dynamicBlock,
				historyBlock,
			} = toModificate;
			countNum.textContent = `№ ${res.account}`;
			balance.innerHTML = `
			<span class="balance__text">Баланс</span>
			<span class="balance__value">${res.balance} ₽</span>
			`;
			console.log(res);
			const balancePerPeriod = new BalancePerPeriod(res, 6);
			const transPerMonth = balancePerPeriod.arrangeBalanceData();
			console.log(transPerMonth);
		})
		.catch((err) => {
			redirectOnExipredSession(err.message);

			if (/^нет\sданных?/i.test(err.message)) {
				console.log('Данные по счету отсутствуют');
			}
		});
}
