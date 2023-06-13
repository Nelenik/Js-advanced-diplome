import { el, mount, setChildren } from 'redom';
import { routes } from './_routes';
import { request, router } from '..';
import { Select } from './Select';
import {
	BalancePerPeriod,
	redirectOnExipredSession,
	sortByStr,
	wait,
	LS,
} from './_helpers';
import mailSvg from '!!svg-inline-loader!../../img/mail.svg';
import arrowSvg from '!!svg-inline-loader!../../img/arrow.svg';

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
			// заменяем скелетное содержимое пришедшими данными
			countNum.textContent = `№ ${res.account}`;
			balance.innerHTML = `
			<span class="balance__text">Баланс</span>
			<span class="balance__value">${res.balance} ₽</span>
			`;
			transactionBlock.innerHTML = '';
			setChildren(transactionBlock, [
				el('h2.transaction__title.title.title--m', 'Новый перевод'),
				createTransferForm(countId),
			]);

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

// строка заголовка
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
	const countNum = el('h2.count-info__num', el('div.sk.sk-text.sk-text--75'));
	const balance = el('p.count-info__balance.balance', [
		el('span.sk.sk-text.sk-text--50'),
		el('span.sk.sk-text.sk-text--50'),
	]);
	const balanceRow = el('div.count-info__balance-row', [countNum, balance]);

	const transactionBlock = el(
		'div.count-info__transaction-wrap.transaction',
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
				console.log(savedCounts);
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

	form.addEventListener('submit', formSbmtHandler(countId));

	return form;
}

// form submit handler
function formSbmtHandler(countId) {
	return function (e) {
		e.preventDefault();
		const targetCountValue = e.target.transSelect.value;
		console.log('submitted');
		const amountValue = e.target.transAmount.value;
		if (targetCountValue.length > 10) {
			if (LS.get('savedCounts')) {
				LS.change('savedCounts', (saved) => {
					saved.push(targetCountValue);
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
			.then((res) => console.log(res))
			.catch((err) => console.log(err));
	};
}
