import { router, headerInstance } from '../..';
import { routes } from './_routes';
import { el } from 'redom';

// import of svg
import arrowSvg from '!!svg-inline-loader!../../../img/arrow.svg';

/*******************************************************/
/*функция проверяет наличие токена с session storage и перенаправляет на страницу авторизации если токена нет*/
export function checkSessionState() {
	const token = sessionStorage.getItem('token');
	if (!token) {
		alert('Время сессии истекло!');
		router.navigate(routes.auth);
	}
}
/*******************************************************/
/*функция перенаправления на главную страницу при истекшей сессии использвать при обработке ошибок. эту ошибку выбрасывает ServerApi.getToken()*/
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
/*функция очищает main перед рендерингом каждой страницы, очищает интервал запроса данных, который запускается на странице счета, и очищает в хранилище "countDataRequestTimeout*/
export function resetPage(main, turnOnMenu = true) {
	main.innerHTML = '';
	headerInstance.enableMenu = turnOnMenu;
	const key = 'countDataRequestTimeout';
	const timeoutId = LS.get(key);
	if (timeoutId) clearTimeout(timeoutId);
	LS.remove(key);
}
/*******************************************************/
// получаем id из квери запроса, применяется на странице "просмотр счета" и "история баланса"
export function getIdFromQueryStr(queryStr) {
	const match = queryStr.match(/id=(.*)/);
	if (match) return match[1];
}
/*******************************************************/
/*функция создания строки с заголовком и кнопкой назад на страницах "посмотр счета" и "история баланса", т.к. они одинаковые на этих 2 страницах, принимает: pageClass(имя блока к которому относится, в нашем случае блоком является имя страницы), pageTitle(строка, название страницы), backRoute(путь для ссылки назад*/
export function createTitleRow(pageClass, pageTitle, backRoute) {
	const backLink = el(
		`a.link-reset.blue-btn.blue-btn--back.${pageClass}__back-link`,
		{
			href: `${backRoute}`,
		}
	);
	backLink.innerHTML = `${arrowSvg} Вернуться назад`;
	backLink.addEventListener('click', (e) => {
		e.preventDefault();
		router.navigate(`${backRoute}`);
		headerInstance.switchActiveLinkState(backRoute);
	});

	return el(`div.${pageClass}__title-row`, [
		el(`h1.${pageClass}__title.title.title--lg`, `${pageTitle}`),
		backLink,
	]);
}
/*******************************************************/

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

/*Класс BalancePerPeriod
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
		this.nowDate = new Date();
		let startMonth = this.nowDate.getMonth() - this.monthesToSubtract;
		let startYear = this.nowDate.getFullYear();
		if (startMonth < 0) {
			const yearToSubtract = Math.ceil(Math.abs(startMonth) / 12);
			startYear = startYear - yearToSubtract;
			startMonth = startMonth + yearToSubtract * 12;
		}
		this.startDate = new Date(startYear, startMonth);
	}
	//   создаем базовую структуру конечного массива с данными
	getBaseStructureOfFinalDataArr() {
		const transByMonths = [];
		const beginFrom = new Date(this.startDate);
		while (beginFrom < this.nowDate) {
			const monthNum = beginFrom.getMonth();
			const monthName = this.monthNames[monthNum];
			const year = beginFrom.getFullYear();
			const checkArray = transByMonths.find(
				(item) => item.month === monthName && item.year === year
			);
			if (!checkArray) {
				transByMonths.push({
					month: monthName,
					year: year,
					transactions: [],
				});
			}
			beginFrom.setMonth(monthNum + 1);
		}
		return transByMonths;
	}
	// вычленяем из исходного массива c транзациями инетерсующий нас период и распределяем элементы по месяцам
	divideTransPerMonth() {
		const finalArray = this.getBaseStructureOfFinalDataArr();
		const searchIndex = this.transArray.findIndex(
			(el) => new Date(el.date) >= this.startDate
		);
		const newTransArr = this.transArray.slice(searchIndex);
		for (let item of newTransArr) {
			const transDate = new Date(item.date);
			const transMonthName = this.monthNames[transDate.getMonth()];
			const transYear = transDate.getFullYear();
			const itemToChangeInd = finalArray.findIndex(
				(item) => item.month === transMonthName && item.year === transYear
			);
			finalArray[itemToChangeInd].transactions.push(item);
		}
		return finalArray;
	}
	// считаем сумму входящих, исходящих транзакций, а также их разницу. нужно для вычисления баланаса на конец месяца
	calculateBalancePerMonth(monthArr) {
		let incoming = 0;
		let outgoing = 0;
		if (monthArr.length > 0) {
			monthArr.forEach((item) => {
				if (item.to === this.countId) {
					incoming += item.amount;
				}
				if (item.from === this.countId) {
					outgoing += item.amount;
				}
			});
		}

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

/*Утилита для работы с localStorage содержит методы get(принимает ключ), set(принимает ключ и сохраняемый элементы), remove(принимает ключ), change(принимает ключ и колбэк, в который передаем полученный из хранилища элемент, изменяем его как нужно внутри функции в зависимости от типа данных) */
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

	static remove(key) {
		localStorage.removeItem(key);
	}
}
/*******************************************************/
