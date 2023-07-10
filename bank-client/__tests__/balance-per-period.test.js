import { BalancePerPeriod } from '../src/js/js-parts/actions/_helpers';

let resposeDataObj = {
	account: '74213041477477406320783754',
	balance: 8714.95,
	mine: true,
	transactions: [
		{
			date: '2022-07-19T05:22:18.649Z',
			from: '74213041477477406320783754',
			to: '25815078724141351478224286',
			amount: 5103.66,
		},
		{
			date: '2022-07-19T17:21:45.778Z',
			from: '52861660744722558762374214',
			to: '74213041477477406320783754',
			amount: 3879,
		},
		{
			date: '2022-08-19T13:48:23.681Z',
			from: '30750258433501348143216887',
			to: '74213041477477406320783754',
			amount: 3900.81,
		},
		{
			date: '2022-08-18T05:44:40.787Z',
			from: '74213041477477406320783754',
			to: '12357780282760117142812688',
			amount: 5879.5,
		},
		{
			date: '2022-09-18T03:32:59.102Z',
			from: '61524364043574371243405305',
			to: '74213041477477406320783754',
			amount: 8743.59,
		},
		{
			date: '2022-10-18T17:40:55.415Z',
			from: '75502770884622113507168768',
			to: '74213041477477406320783754',
			amount: 9048.34,
		},
		{
			date: '2022-11-18T03:28:02.290Z',
			from: '53046531788336786315342135',
			to: '74213041477477406320783754',
			amount: 22.51,
		},
		{
			date: '2022-11-18T05:12:54.803Z',
			from: '74213041477477406320783754',
			to: '31033837654507267823831757',
			amount: 1727.62,
		},
		{
			date: '2022-12-19T15:28:43.984Z',
			from: '74213041477477406320783754',
			to: '82666337022827255727377153',
			amount: 6533.79,
		},
		{
			date: '2023-01-17T07:20:23.355Z',
			from: '73486381453584830040151577',
			to: '74213041477477406320783754',
			amount: 4731.9,
		},
		{
			date: '2023-01-17T15:31:46.269Z',
			from: '74720415381570668378415263',
			to: '74213041477477406320783754',
			amount: 5232.93,
		},
		{
			date: '2023-03-17T17:46:58.613Z',
			from: '22764706324542763505761723',
			to: '74213041477477406320783754',
			amount: 2228.35,
		},
		{
			date: '2023-03-18T06:25:47.351Z',
			from: '21446724541285701541784338',
			to: '74213041477477406320783754',
			amount: 3039.16,
		},
		{
			date: '2023-04-17T02:18:12.890Z',
			from: '70536331801485614877452001',
			to: '74213041477477406320783754',
			amount: 3450.69,
		},
		{
			date: '2023-04-18T01:47:48.510Z',
			from: '74213041477477406320783754',
			to: '51263336456447513830734214',
			amount: 6663.46,
		},
		{
			amount: 473.4,
			date: '2023-05-16T07:21:07.793Z',
			from: '21231120706128303622217154',
			to: '74213041477477406320783754',
		},
		{
			amount: 895.67,
			date: '2023-05-16T07:33:39.120Z',
			from: '32360552013738154372556154',
			to: '74213041477477406320783754',
		},
		{
			amount: 593.8,
			date: '2023-06-10T19:41:29.828Z',
			from: '14822200100167360506754554',
			to: '74213041477477406320783754',
		},
		{
			amount: 926.16,
			date: '2023-06-10T19:41:37.903Z',
			from: '25534143020563478388471662',
			to: '74213041477477406320783754',
		},
		{
			amount: 824.17,
			date: '2023-06-10T19:41:46.000Z',
			from: '02521584162365611433324646',
			to: '74213041477477406320783754',
		},
	],
};

test('Arranged balance data for 3 monthes if transactions exist', () => {
	const balanceDataInst = new BalancePerPeriod(resposeDataObj, 2);
	const arrangedBalanceData = balanceDataInst.arrangeBalanceData();
	expect(arrangedBalanceData).toEqual([
		{
			month: 'май',
			year: 2023,
			transactions: {
				incoming: 1369.07,
				outgoing: 0,
				difference: 1369.07,
				commonTransSum: 1369.07,
				balance: 6370.820000000001,
			},
		},
		{
			month: 'июн',
			year: 2023,
			transactions: {
				incoming: 2344.13,
				outgoing: 0,
				difference: 2344.13,
				commonTransSum: 2344.13,
				balance: 8714.95,
			},
		},
		{
			month: 'июл',
			year: 2023,
			transactions: {
				incoming: 0,
				outgoing: 0,
				difference: 0,
				commonTransSum: 0,
				balance: 8714.95,
			},
		},
	]);
});

test('Arranged balance data for last month if there are no transactions', () => {
	const balanceDataInst = new BalancePerPeriod(resposeDataObj, 0);
	const arrangedBalanceData = balanceDataInst.arrangeBalanceData();
	expect(arrangedBalanceData).toEqual([
		{
			month: 'июл',
			year: 2023,
			transactions: {
				incoming: 0,
				outgoing: 0,
				difference: 0,
				commonTransSum: 0,
				balance: 8714.95,
			},
		},
	]);
});
