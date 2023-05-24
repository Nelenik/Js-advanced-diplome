import { el, mount, setChildren } from 'redom';
import { routes } from './_routes';
import { request, router } from '..';
import { Card } from './_card';

// import plusSvg from '!!svg-inline-loader!../../img/plus.svg';
// import checkSvg from '!!svg-inline-loader!../../img/check.svg';

const cardsList = el('ul.list-reset.counts-page__counts');
let countsData = [];

export function countsPage(main, headerInstance) {
	main.innerHTML = '';
	headerInstance.enableMenu = true;

	const container = el('div.container.counts-page', [
		el('h1.counts-page__title.title', 'Ваши счета'),
		createControlPanel(),
		cardsList,
	]);
	mount(main, container);
	createCardsByRequest();
}

function createControlPanel() {
	const controlsWrap = el('div.counts-page__controls');
	const radioContent = [
		{ text: 'По номеру', value: 'account' },
		{ text: 'По балансу', value: 'balance' },
		{ text: 'По последней транзакции', value: 'transaction' },
	];
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

	newCount.addEventListener('click', newCountHandler);
	setChildren(controlsWrap, [sorting, newCount]);
	return controlsWrap;
}

//создаем список карточек по запросу
function createCardsByRequest() {
	//сначала загружаем скелет, из хранилища берем количество карточек из предыдущего запроса
	for (let i = 0; i < (+localStorage.getItem('_countsQuantity') || 1); i++) {
		new Card().appendCard(cardsList);
	}
	// делаем запрос на сервер и после получения ответа отрисовываем карточки
	request
		.getCounts()
		.then((res) => {
			countsData = [...res];
			console.log(countsData);
			localStorage.setItem('_countsQuantity', `${res.length}`);
			cardsList.innerHTML = '';
			res.forEach((item) => {
				const card = new Card();
				card.updateCard(item);
				card.appendCard(cardsList);
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
