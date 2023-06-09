import { el, mount } from 'redom';
import { request } from '..';
import { Card } from './classes/Card';
import { Select } from './classes/Select';
import { sortByProp, LS } from './actions/_helpers';

// import plusSvg from '!!svg-inline-loader!../../img/plus.svg';
// import checkSvg from '!!svg-inline-loader!../../img/check.svg';

const cardsList = el('ul.list-reset.counts-page__counts');
let countsData = [];

export function countsPage(main) {
	const container = el('div.container.counts-page', [
		el('h1.counts-page__title.title.title--lg', 'Ваши счета'),
		createControlPanel(),
		cardsList,
	]);
	mount(main, container);
	createCardsByRequest();
}

function createControlPanel() {
	const controlsWrap = el('div.counts-page__controls');
	const selectContent = [
		{ text: 'По номеру', value: 'account', name: 'sort' },
		{ text: 'По балансу', value: 'balance', name: 'sort' },
		{
			text: 'По последней транзакции',
			value: 'transactions.0.date',
			name: 'sort',
		},
	];

	const sorter = new Select({
		selectContent: selectContent,
		onSelect: (inst, value) => {
			countsData.sort(sortByProp(value));
			cardsList.innerHTML = '';
			countsData.forEach((item) => {
				const card = new Card();
				card.updateCard(item);
				card.appendCard(cardsList);
			});
		},
		additionalClass: 'counts-page__sorting',
		placeholderText: 'Сортировка',
		toChangePlaceholder: false,
	});
	const newCount = el(
		'button.btn-reset.counts-page__new-count.blue-btn',
		{ type: 'button' },
		'Создать новый счет'
	);

	newCount.addEventListener('click', newCountHandler);
	mount(controlsWrap, newCount);
	sorter.prependAt(controlsWrap);
	// setChildren(controlsWrap, [sorterWrap, newCount]);
	return controlsWrap;
}

//создаем список карточек по запросу
function createCardsByRequest() {
	//сначала загружаем скелет, из хранилища берем количество карточек из предыдущего запроса
	for (let i = 0; i < (+LS.get('_countsQuantity') || 1); i++) {
		new Card().appendCard(cardsList);
	}
	// делаем запрос на сервер и после получения ответа отрисовываем карточки
	request
		.getCounts()
		.then((res) => {
			countsData = [...res];
			LS.set('_countsQuantity', `${res.length}`);
			cardsList.innerHTML = '';
			res.forEach((item) => {
				const card = new Card();
				card.updateCard(item);
				card.appendCard(cardsList);
			});
		})
		.catch((err) => {
			// redirectOnExipredSession(err.message);

			if (/^нет\sданных?/i.test(err.message)) {
				console.log('У вас пока нет счетов');
			}
		});
}

//обработчик кнопки создания нового счета
function newCountHandler() {
	const card = new Card();
	card.appendCard(cardsList);
	request
		.createCount()
		.then((res) => {
			countsData.push(res);
			card.updateCard(res);
		})
		.catch((err) => console.log(err));
}
