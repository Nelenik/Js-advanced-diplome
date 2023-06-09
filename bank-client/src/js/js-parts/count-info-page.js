import { el, mount } from 'redom';
import { routes } from './_routes';
import { request, router } from '..';
import { Select } from './Select';
import { BalancePerPeriod } from './_helpers';

export function countInfoPage(main, headerInstance, countId) {
	main.innerHTML = '';
	headerInstance.enableMenu = true;
	request
		.getCountInfo(countId)
		.then((res) => {
			console.log(res);
			const balance = new BalancePerPeriod(res, 30);
			console.log(balance);
			const transPerMonth = balance.arrangeBalanceData();
			console.log(transPerMonth);
		})
		.catch((err) => {
			console.log(err);
		});
}
