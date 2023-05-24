import { el, mount, setChildren } from 'redom';
import { routes } from './_routes';
import { request, router } from '..';
// import plusSvg from '!!svg-inline-loader!../../img/plus.svg';
// import checkSvg from '!!svg-inline-loader!../../img/check.svg';

class Card {
	constructor() {
		this.card = el('li.card');
		this.countNum = el('h2.card__count-num', el('div.sk.sk-text.sk-text--50'));
		this.balance = el('p.card__balance', el('div.sk.sk-text.sk-text--25'));
		const cardFooter = el('div.card__footer');
		this.lastTrasaction = el('p.card__transaction', [
			el('div.sk.sk-text.sk-text--50'),
			el('div.sk.sk-text.sk-text--30'),
		]);
		this.btn = el('button.btn-reset.sk.sk-btn', { type: 'button' });
		setChildren(cardFooter, [this.lastTrasaction, this.btn]);
		setChildren(this.card, [this.countNum, this.balance, cardFooter]);
	}

	getFormattedDate(dateStr) {
		const date = new Date(dateStr);
		const monthes = [
			'января',
			'февраля',
			'марта',
			'апреля',
			'мая',
			'июня',
			'июля',
			'августа',
			'сентября',
			'октября',
			'ноября',
			'декабря',
		];
		return `${date.getDate()} ${
			monthes[date.getMonth()]
		} ${date.getFullYear()}`;
	}

	updateCard(data) {
		this.countNum.textContent = data.account;
		this.balance.textContent = data.balance;
		this.lastTrasaction.innerHTML = `<strong>Последняя транзакция:</strong> ${this.getFormattedDate(
			data.transactions[0].date
		)}`;
		this.btn.textContent = 'Открыть';
		this.btn.setAttribute('class', 'blue-btn blue-btn--sm card__btn');
	}
}

export function countsPage(main, headerInstance) {
	main.innerHTML = '';
	headerInstance.enableMenu = true;
	const container = el('div.container.counts-page', [
		el('h1.counts-page__title.title', 'Ваши счета'),
		createControlPanel(),
		createCardList(),
	]);
	mount(main, container);
}

function createControlPanel() {
	const radioContent = [
		{ text: 'По номеру', value: 'account' },
		{ text: 'По балансу', value: 'balance' },
		{ text: 'По последней транзакции', value: 'transaction' },
	];
	const controlsWrap = el('div.counts-page__controls');
	const radioBtns = radioContent.map((item) => {
		return el('label.sorting__choice', [
			el('input.sorting__def-radio', { type: 'radio', value: item.value }),
			el('span.sorting__choice-text', item.text),
		]);
	});
	const sorting = el('div.counts-page__sorting.sorting', [
		el('button.btn-reset.sorting__btn', { type: 'button' }, 'Сортировка'),
		el('div.sorting__dropdown', [...radioBtns]),
	]);
	const newCount = el(
		'button.btn-reset.counts-page__new-count.blue-btn',
		{ type: 'button' },
		'Создать новый счет'
	);
	setChildren(controlsWrap, [sorting, newCount]);
	return controlsWrap;
}

function createCardList() {
	const list = el('ul.list-reset.counts-page__counts');
	for (let i = 0; i < (localStorage.getItem('_countsQuantity') || 1); i++) {
		mount(list, new Card().card);
	}
	request
		.getCounts()
		.then((res) => {
			console.log(res);
			localStorage.setItem('_countsQuantity', `${res.length}`);
			list.innerHTML = '';
			res.forEach((item) => {
				const card = new Card();
				console.log(card);
				card.updateCard(item);
				console.log(card);
				mount(list, card.card);
			});
		})
		.catch((err) => {
			if (/^session\sexpired?/i.test(err.message)) {
				console.log(err.message);
				router.navigate(routes.auth);
			}
			if (/^нет\sданных?/i.test(err.message)) {
				console.log('У вас пока нет счетов');
			}
		});

	return list;
}
