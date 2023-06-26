import { el, mount, setChildren } from 'redom';
import { routes } from '../actions/_routes';
import { router, headerInstance } from '../..';
export class Card {
	constructor() {
		this.card = el('li.card');
		this.countNum = el('h2.card__count-num', el('div.sk.sk-text.sk-text--50'));
		this.balance = el('p.card__balance', el('div.sk.sk-text.sk-text--25'));
		const cardFooter = el('div.card__footer');
		this.lastTransaction = el('p.card__transaction', [
			el('div.sk.sk-text.sk-text--50'),
			el('div.sk.sk-text.sk-text--30'),
		]);
		this.cardLink = el('a.sk.sk-btn');
		setChildren(cardFooter, [this.lastTransaction, this.cardLink]);
		setChildren(this.card, [this.countNum, this.balance, cardFooter]);
	}

	getFormattedDate(dateStr) {
		if (!dateStr) return null;
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
	// при получении данных скелетное содержимое элементов заменяется на пришедшие данные
	updateCard(data) {
		this.countNum.textContent = data.account;
		this.balance.textContent = `${data.balance} ₽`;
		let dateStr = data.transactions[0]
			? this.getFormattedDate(data.transactions[0].date)
			: 'нет транзакций';
		this.lastTransaction.innerHTML = `<strong>Последняя транзакция:</strong> ${dateStr}`;
		this.cardLink.textContent = 'Открыть';
		this.cardLink.setAttribute(
			'class',
			'link-reset blue-btn blue-btn--sm card__link'
		);
		const href = `${routes.countInfo}?id=${data.account}`;
		this.cardLink.href = href;
		this.cardLink.addEventListener('click', (e) => {
			e.preventDefault();
			router.navigate(href);
			headerInstance.switchActiveLinkState(routes.countInfo);
		});
	}

	appendCard(target) {
		mount(target, this.card);
	}
}
