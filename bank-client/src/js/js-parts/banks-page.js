import { el, mount } from 'redom';
import { request } from '..';
import { checkSessionState, resetPage } from './actions/_helpers';
import * as ymaps3 from 'ymaps3';
import mapPlug from '../../img/map-plug.png';
import markSvg from '!!svg-inline-loader!../../img/mark.svg';

export async function banksPage(main) {
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

	await ymaps3.ready;
	const banksCoords = await request.getBanks();
	const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } =
		ymaps3;
	const POINTS = banksCoords.map((item) => {
		const img = el('div.map-mark', { title: 'Coin' });
		img.innerHTML = markSvg;
		return new YMapMarker(
			{
				coordinates: [item.lon, item.lat],
			},
			img
		);
	});
	new YMap(
		mapBlock,
		{
			location: {
				center: [37.61019, 55.74933],
				zoom: 12,
			},
		},
		[new YMapDefaultSchemeLayer(), new YMapDefaultFeaturesLayer(), ...POINTS]
	);
}
