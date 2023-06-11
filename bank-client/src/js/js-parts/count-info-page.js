import { el, mount, setChildren } from 'redom';
import { routes } from './_routes';
import { request, router } from '..';
import { Select } from './Select';
import { BalancePerPeriod } from './_helpers';

const countInfoBlock = el('div.count-info__data-block');
export function countInfoPage(main, headerInstance, countId) {
	main.innerHTML = '';
	headerInstance.enableMenu = true;

	const container = el('div.container.count-info', [
		createTitleBlock(),
		countInfoBlock,
	]);
	getHistoryData(countId);
	mount(main, container);
}

function createTitleBlock() {
	const backLink = el(
		'a.link-reset.blue-btn.count-info__back-link',
		{ href: `${routes.accounts}` },
		'Вернуться назад'
	);
	backLink.addEventListener('click', (e) => {
		e.preventDefault();
		router.navigate(`${routes.accounts}`);
	});

	return el('div.count-info__title-wrap', [
		el('h1.count-info__title', 'Просмотр счета'),
		backLink,
	]);
}

function pageSkeletone() {
	setChildren(countInfoBlock, [
		el('div.sk-flex', [
			el('div.sk.sk-text.sk-text--30'),
			el('div', [
				el('span.sk.sk-text.sk-text--25'),
				el('span.sk.sk-text.sk-text--25'),
			]),
		]),
	]);
}

// действия с результатом запроса
function getHistoryData(countId) {
	pageSkeletone();
	request
		.getCountInfo(countId)
		.then((res) => {
			const balance = new BalancePerPeriod(res, 6);
			const transPerMonth = balance.arrangeBalanceData();
			console.log(transPerMonth);
		})
		.catch((err) => {
			console.log(err);
		});
}
