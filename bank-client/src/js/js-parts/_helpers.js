/*функция для сортировки массива объектов по свойству
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
	//находим индекс элемента с которого начинается рассчет баланса
	findIndex() {
		let left = 0;
		let right = this.transArray.length - 1;
		while (left <= right) {
			let middle = Math.floor((left + right) / 2);
			const elemDate = new Date(this.transArray[middle].date);
			elemDate.setDate(1);
			elemDate.setHours(0, 0, 0, 0);
			if (elemDate < this.startDate) {
				left = middle + 1;
			} else {
				right = middle - 1;
			}
		}
		return left > this.transArray.length - 1 ? -1 : left;
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
		const searchIndex = this.findIndex();
		const newTransArr = this.transArray.slice(searchIndex);
		const transByMonths = {};
		for (let item of newTransArr) {
			const transDate = new Date(item.date);
			const monthName = this.monthNames[transDate.getMonth()];
			if (!transByMonths[monthName]) {
				transByMonths[monthName] = [];
			}
			transByMonths[monthName].push(item);
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
		let difference = incoming - outgoing;
		return { incoming, outgoing, difference };
	}

	arrangeBalanceData() {
		const transPerMonth = Object.entries(this.divideTransPerMonth());
		const balancePerMonth = [];
		let toSubtractDifference = 0;
		for (let i = transPerMonth.length - 1; i >= 0; i--) {
			const [key, value] = transPerMonth[i];
			const { incoming, outgoing, difference } =
				this.calculateBalancePerMonth(value);
			this._startBalance -= toSubtractDifference;
			toSubtractDifference = difference;
			balancePerMonth.unshift([
				key,
				{
					transPerMonth: value,
					incoming: incoming,
					outgoing: outgoing,
					balance: this._startBalance,
				},
			]);
		}
		return balancePerMonth;
	}
}
/*******************************************************/
