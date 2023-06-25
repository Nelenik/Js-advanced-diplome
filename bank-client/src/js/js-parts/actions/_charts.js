import { Chart } from 'chart.js/auto';
/***********************DIAGRAMS******************************/
// плагин для рамки вокруг поля диаграмы
const chartAreaBorder = {
	id: 'chartAreaBorder',
	afterDraw(chart, args, options) {
		const {
			ctx,
			chartArea: { left, top, width, height },
		} = chart;
		ctx.save();
		ctx.strokeStyle = options.borderColor;
		ctx.lineWidth = options.borderWidth;
		ctx.strokeRect(left, top, width, height);
		ctx.restore();
	},
};
// функция настройки диаграммы динамика баланса
export function setBalanceDynamicChart(canvas, balanceDataObj) {
	const monthes = balanceDataObj.map((item) => item.month);
	// вставляем пустые строки для увеличения отступов слева и справа от крайних столбцов
	monthes.unshift('');
	monthes.push('');
	const transDiff = balanceDataObj.map((item) => item.transactions.difference);
	const max = Math.ceil(Math.max(...transDiff));
	let min = Math.floor(Math.min(...transDiff));
	min = min < 0 ? min : 0;
	// данные для динамики баланса
	const data = {
		labels: monthes,
		datasets: [
			{
				data: transDiff,
				backgroundColor: '#116ACC',
				borderColor: '#116ACC',
			},
		],
	};
	// вставляем в datasets в начало и конец массива null для отступов
	data.datasets[0].data.unshift(null);
	data.datasets[0].data.push(null);
	// настройки диаграммы
	const chartConfig = {
		type: 'bar',
		data: data,
		options: {
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					usePointStyle: true,
					callbacks: {
						title: (context) => {
							const month = context[0].label;
							const year = balanceDataObj.find(
								(item) => item.month === month
							).year;
							return `${month} ${year}`;
						},
						labelPointStyle: (context) => {
							const isOut = context.formattedValue.startsWith('-');
							if (isOut)
								return { pointStyle: 'triangle', rotation: 180, radius: 2 };
							else return { pointStyle: 'triangle', radius: 2 };
						},
					},
				},
				chartAreaBorder: {
					borderColor: '#000000',
					borderWidth: 1,
				},
			},
			scales: {
				y: {
					border: { display: false },
					grid: {
						drawTicks: false,
					},
					beginAtZero: true,
					position: 'right',
					min: min,
					max: max,
					ticks: {
						labelOffset: 7,
						maxTicksLimit: min < 0 ? 3 : 2,
						color: '#000000',
						font: { weight: '500', size: 16 },
						padding: 0,
						callback: function (value) {
							// Добавляем отступы слева от подписи
							return '      ' + value + ' ₽';
						},
					},
				},
				x: {
					offset: false,
					border: { display: false },
					grid: {
						display: false,
					},
					ticks: {
						color: '#000000',
						font: { weight: '700', size: 16 },
					},
				},
			},
		},
		plugins: [chartAreaBorder],
	};

	new Chart(canvas, chartConfig);
}

// функция настройки диаграммы соотношение входящих и исходящих транзакций
export function setTransactionsRatioChart(canvas, balanceDataObj) {
	const monthes = balanceDataObj.map((item) => item.month);
	// вставляем пустые строки для увеличения отступов слева и справа от крайних столбцов
	monthes.unshift('');
	monthes.push('');
	const commonTransSums = balanceDataObj.map(
		(item) => item.transactions.commonTransSum
	);
	const min = 0;
	const max = Math.ceil(Math.max(...commonTransSums));
	const outgoing = balanceDataObj.map((item) => item.transactions.outgoing);
	const outgoingMax = Math.max(...outgoing);
	const incoming = balanceDataObj.map((item) => item.transactions.incoming);
	const incomingMax = Math.max(...incoming);
	const minFromInAndOutMax = Math.min(outgoingMax, incomingMax);
	const data = {
		labels: monthes,
		datasets: [
			{
				data: outgoing,
				backgroundColor: '#FD4E5D',
				borderColor: '#FD4E5D',
			},
			{
				data: incoming,
				backgroundColor: '#76CA66',
				borderColor: '#76CA66',
			},
		],
	};
	// вставляем в datasets в начало и конец массива null для отступов
	data.datasets[0].data.unshift(null);
	data.datasets[0].data.push(null);
	data.datasets[1].data.unshift(null);
	data.datasets[1].data.push(null);
	// настройки диаграммы
	const chartConfig = {
		type: 'bar',
		data: data,
		options: {
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					usePointStyle: true,
					callbacks: {
						title: (context) => {
							const month = context[0].label;
							const year = balanceDataObj.find(
								(item) => item.month === month
							).year;
							return `${month} ${year}`;
						},
						labelPointStyle: () => {
							return { pointStyle: 'rect' };
						},
					},
				},
				chartAreaBorder: {
					borderColor: '#000000',
					borderWidth: 1,
				},
			},
			scales: {
				y: {
					stacked: true,
					border: { display: false },
					grid: {
						display: false,
					},
					beginAtZero: true,
					beforeTickToLabelConversion: (ctx) => {
						ctx.ticks = [];
						ctx.ticks.push({ value: min, label: `      ${min} ₽` });
						ctx.ticks.push({
							value: minFromInAndOutMax,
							label: `      ${minFromInAndOutMax} ₽`,
						});
						ctx.ticks.push({ value: max, label: `     ${max} ₽` });
					},
					position: 'right',
					min: min,
					max: max,
					ticks: {
						labelOffset: 7,
						color: '#000000',
						font: { weight: '500', size: 16 },
						padding: 0,
					},
				},
				x: {
					offset: false,
					stacked: true,
					border: { display: false },
					grid: {
						display: false,
					},
					ticks: {
						color: '#000000',
						font: { weight: '700', size: 16 },
					},
				},
			},
		},
		plugins: [chartAreaBorder],
	};

	new Chart(canvas, chartConfig);
}
