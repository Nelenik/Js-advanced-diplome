import { el, mount } from 'redom';
import { routes } from './_routes';
import { request, router } from '..';
import { Select } from './Select';
import { GetIndex } from './_helpers';

export function countInfoPage(main, headerInstance, countId) {
	main.innerHTML = '';
	headerInstance.enableMenu = true;
	request
		.getCountInfo(countId)
		.then((res) => {
			console.log(res);
			let ind = GetIndex.index(res.transactions, compare);
			console.log(ind);
		})
		.catch((err) => {
			console.log(err);
		});
}

function compare(arr, middle) {
	const nowDate = new Date();
	const lastDateStart = new Date(nowDate.getFullYear() - 1, nowDate.getMonth());
	const elemDate = new Date(arr[middle].date);
	elemDate.setDate(1);
	elemDate.setHours(0, 0, 0, 0);
	return elemDate < lastDateStart;
}
