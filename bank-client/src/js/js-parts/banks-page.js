import { el, mount, setChildren } from 'redom';
import { routes } from './actions/_routes';
import { request } from '..';
import { checkSessionState, resetPage, LS } from './actions/_helpers';
import mapPlug from '../../img/map-plug.jpg';
console.log(mapPlug);

export function banksPage(main) {
	checkSessionState();
	resetPage(main);

	const mapBlock = el(
		'div.banks__map-block',
		{ id: 'banks-map' },
		el('img.banks__map-plug', {
			src: `${mapPlug}`,
			alt: 'Изображение карты банокматов компании Coin',
		})
	);
	const container = el('div.container.banks', [
		el('h1.banks__title.title.title--lg', 'Карта банкоматов'),
		mapBlock,
	]);
	mount(main, container);

	request.getBanks().then((res) => {
		console.log(res);
	});
}
