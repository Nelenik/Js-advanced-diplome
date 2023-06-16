import { router } from '../..';
import { routes } from './_routes';

/*функция перенаправления на главную страницу при истекшей сессии*/
export function redirectOnExipredSession(message) {
	if (/^session\sexpired?/i.test(message)) {
		console.log(message);
		router.navigate(routes.auth);
	}
}
/*******************************************************/

/* функция wait*/
export function wait(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
/*******************************************************/

/*пользовательская функция метода массивов sort(), сортирует по заданной подстроке = arr.sort(sortByStr('str')*/
export function sortByStr(str) {
	return (a, b) => {
		const regexp = new RegExp('^' + str);
		const testA = regexp.test(a);
		const testB = regexp.test(b);
		if (testA && !testB) return -1;
		if (testA && testB && a < b) return -1;
		if (!testA && !testB) return 0;
	};
}
/*******************************************************/

/*пользовательская функция метода массивов sort(), сортирует по имени свойства
arr.sort(sortBy('name'))
если объект имеет более сложную структуру например :
{
  name: 'Pete',
  age: 20,
  lastVisit: [{date: '2022-01-01'}]
}, вызов сортировки => arr.sort(sortBy('lastVisit.0.date')) т.е. обращаемся к первому элементу массива lastVisit и берем его свойсвто date

*/
export function sortBy(prop) {
	const props = prop.split('.');
	return (a, b) => {
		let aValue = a;
		let bValue = b;
		for (let item of props) {
			aValue = aValue ? aValue[item] : undefined;
			bValue = bValue ? bValue[item] : undefined;
		}
		if (typeof aValue === 'undefined' && typeof bValue === 'undefined') {
			return 0;
		} else if (typeof aValue === 'undefined') {
			return 1;
		} else if (typeof bValue === 'undefined') {
			return -1;
		} else if (typeof aValue === 'string' && typeof bValue === 'string') {
			if (!isNaN(Date.parse(aValue)) && !isNaN(Date.parse(bValue))) {
				return Date.parse(bValue) - Date.parse(aValue);
			}
			return aValue.localeCompare(bValue);
		} else if (typeof aValue === 'number' && typeof bValue === 'number') {
			return aValue - bValue;
		}
	};
}
/*******************************************************/

/*
 Класс BalancePerPeriod используется для вычисления и организации данных о балансе счета на протяжении заданного периода. Он принимает информацию о балансе и транзакциях, определяет начальную дату для расчета и группирует транзакции по месяцам. Затем класс вычисляет баланс на конец каждого месяца, учитывая входящие и исходящие транзакции. Результат представлен в виде массива с информацией о месяце, транзакциях и балансе.
 - monthesToSubtract - это за сколько месяцев нужно посчитать баланс. Нужно иметь в виду что отсчет идет с 0, т.е. если нужен период в 6 мес, указываем 5;
 -response - это объект полученный из запроса. Код учитывает конкретную структуру данных
*/
export class BalancePerPeriod {
	monthNames = [
		'янв',
		'фев',
		'мар',
		'апр',
		'май',
		'июн',
		'июл',
		'авг',
		'сен',
		'окт',
		'ноя',
		'дек',
	];
	constructor(response, monthesToSubtract) {
		this.currentBalance = response.balance;
		this._startBalance = this.currentBalance;
		this.transArray = response.transactions;
		this.countId = response.account;
		this.monthesToSubtract = monthesToSubtract;
		this.getStartDate();
	}
	// получаем дату с которой начинаем отсчет, например 6/12 мес назад
	getStartDate() {
		const nowDate = new Date();
		let startMonth = nowDate.getMonth() - this.monthesToSubtract;
		let startYear = nowDate.getFullYear();
		if (startMonth < 0) {
			const yearToSubtract = Math.ceil(Math.abs(startMonth) / 12);
			startYear = startYear - yearToSubtract;
			startMonth = startMonth + yearToSubtract * 12;
		}
		this.startDate = new Date(startYear, startMonth);
	}
	// вычленяем из исходного массива c транзациями инетерсующий нас период и распределяем элементы по месяцам
	divideTransPerMonth() {
		const searchIndex = this.transArray.findIndex(
			(el) => new Date(el.date) >= this.startDate
		);
		const newTransArr = this.transArray.slice(searchIndex);
		// const transByMonths = {};
		const transByMonths = [];
		for (let item of newTransArr) {
			const transDate = new Date(item.date);
			const monthName = this.monthNames[transDate.getMonth()];
			const year = transDate.getFullYear();
			let checkArray = transByMonths.find((item) => {
				return item.month === monthName && item.year === year;
			});
			if (!checkArray) {
				transByMonths.push({
					month: monthName,
					year: year,
					transactions: [item],
				});
			} else {
				checkArray.transactions.push(item);
			}
		}
		return transByMonths;
	}
	// считаем сумму входящих, исходящих транзакций, а также их разницу. нужно для вычисления баланаса на конец месяца
	calculateBalancePerMonth(monthArr) {
		let incoming = 0;
		let outgoing = 0;
		monthArr.forEach((item) => {
			if (item.to === this.countId) {
				incoming += item.amount;
			}
			if (item.from === this.countId) {
				outgoing += item.amount;
			}
		});
		return { incoming, outgoing };
	}

	arrangeBalanceData() {
		const transPerMonth = this.divideTransPerMonth();
		let toSubtractDifference = 0;
		const balancePerMonth = transPerMonth
			.reverse()
			.map((item) => {
				const { incoming, outgoing } = this.calculateBalancePerMonth(
					item.transactions
				);
				const difference = incoming - outgoing;
				const commonTransSum = incoming + outgoing;
				this._startBalance -= toSubtractDifference;
				toSubtractDifference = difference;
				item.transactions = {
					incoming: incoming,
					outgoing: outgoing,
					difference: difference,
					commonTransSum: commonTransSum,
					balance: this._startBalance,
				};
				return item;
			})
			.reverse();
		return balancePerMonth;
	}
}
/*******************************************************/

/*Утилита для работы с localStorage содержит методы get(принимает ключ), set(принимает ключ и сохраняемый элементы) и change(принимает ключ и колбэк, в который передаем полученный из хранилища элемент, изменяем его как нужно внутри функции в зависимости от типа данных) */
export class LS {
	static get(key) {
		let saved = localStorage.getItem(key);
		if (saved) return JSON.parse(saved);
		else return false;
	}

	static set(key, item) {
		localStorage.setItem(key, JSON.stringify(item));
	}

	static change(key, func) {
		let saved = LS.get(key);
		func(saved);
		LS.set(key, saved);
	}
}
/*******************************************************/
