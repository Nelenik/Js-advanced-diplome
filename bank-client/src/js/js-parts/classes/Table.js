import { el, mount } from 'redom';

/*Класс Table
Класс Table предоставляет способ создания и отображения таблицы с историей транзакций. Инициализация:
new Table(countId, tableData);
--countId - это номер счета;
--tableData - это массив с транзакциями, которые нужно отобразить в конкретный период времени,

Свойства: instance.tableData = [{..}, {...}] - перерисует tbody таблицы;
Методы: instance.appendEl(target) - вставляет таблицу в указанный(target) элемент
*/
export class Table {
	thLables = ['Счет отправителя', 'Счёт получателя', 'Сумма', 'Дата'];

	constructor(countId, tableData) {
		this.countId = countId;
		this.tbody = el('tbody.history-table__tbody');
		this.tableData = tableData;
		this.table = el('table.history-table', [this.createTHead(), this.tbody]);
	}

	createTHead() {
		const thArr = this.thLables.map((item) =>
			el('th.head-row__cell', el('span.head-row__text', item))
		);
		return el('thead', el('tr.history-table__head-row.head-row', thArr));
	}

	set tableData(value) {
		this.tbody.innerHTML = '';
		this._tableData = value;
		value.forEach((item) => {
			let sender = item.from,
				recipient = item.to,
				amount =
					item.to === this.countId
						? `+ ${item.amount} ₽`
						: `- ${item.amount} ₽`,
				date = this.formateDate(item.date);
			mount(this.tbody, this.createRow([sender, recipient, amount, date]));
		});
	}

	get tableData() {
		return this._tableData;
	}

	formateDate(date) {
		const dateObj = new Date(date);
		let dd = dateObj.getDate();
		dd = dd > 10 ? dd : `0${dd}`;
		let mm = dateObj.getMonth() + 1;
		mm = mm > 10 ? mm : `0${mm}`;
		return `${dd}.${mm}.${dateObj.getFullYear()}`;
	}

	createRow(rowData) {
		const tdArr = rowData.map((item, ind) => {
			const cellInner = el('span.body-row__text', `${item}`);
			if (/(^\+)|(^-)/.test(item)) {
				const incoming = /^\+/.test(item);
				incoming
					? cellInner.classList.add('amount', 'amount--in')
					: cellInner.classList.add('amount', 'amount--out');
			}
			return el(
				'td.body-row__cell',
				{ 'data-label': this.thLables[ind] },
				cellInner
			);
		});
		return el('tr.body-row', [...tdArr]);
	}

	appendEl(target) {
		target.append(this.table);
	}
}
