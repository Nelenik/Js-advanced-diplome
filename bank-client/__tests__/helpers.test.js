import {
	getIdFromQueryStr,
	sortByStr,
} from '../src/js/js-parts/actions/_helpers';

// getIdFromQueryStr test
describe('Check correct extraction of id-number from str', () => {
	const testValues = [
		{
			descr: 'passes strings like id=74213041477477406320783754',
			testStr: 'id=74213041477477406320783754',
			result: '74213041477477406320783754',
		},
		{
			descr: 'string like "id"',
			testStr: 'id',
			result: undefined,
		},
		{
			descr: 'string like "id="',
			testStr: 'id=',
			result: undefined,
		},
		{
			descr: 'empty string',
			testStr: '',
			result: undefined,
		},
	];

	testValues.forEach((item) => {
		test(`${item.descr}`, () => {
			expect(getIdFromQueryStr(item.testStr)).toBe(item.result);
		});
	});
});

// sortByStr test
describe('Checking sorting by substring in array of strings', () => {
	const testArr = [
		'4929655516690972',
		'5242854708248833',
		'',
		'345799143913219',
		'6011575176812860',
		'17307867273606026235887604',
		'10086808810856223551188574',
		'344391579913219',
		'4929906555166972',
		'17783078672736060262358604',
	];
	const testValues = [
		{
			descr: 'testing an empty str',
			value: '',
			result: [
				'',
				'10086808810856223551188574',
				'17307867273606026235887604',
				'17783078672736060262358604',
				'344391579913219',
				'345799143913219',
				'4929655516690972',
				'4929906555166972',
				'5242854708248833',
				'6011575176812860',
			],
		},
		{
			descr: 'sorting elements which starts with "1"',
			value: '1',
			result: [
				'10086808810856223551188574',
				'17307867273606026235887604',
				'17783078672736060262358604',
				'4929655516690972',
				'5242854708248833',
				'',
				'345799143913219',
				'6011575176812860',
				'344391579913219',
				'4929906555166972',
			],
		},
		{
			descr: 'sorting elements which starts with "34"',
			value: '34',
			result: [
				'344391579913219',
				'345799143913219',
				'4929655516690972',
				'5242854708248833',
				'',
				'6011575176812860',
				'17307867273606026235887604',
				'10086808810856223551188574',
				'4929906555166972',
				'17783078672736060262358604',
			],
		},
		{
			descr:
				'testing case if array does not includes an element starting with a substr',
			value: '999',
			result: [...testArr],
		},
	];
	testValues.forEach((item) => {
		test(`${item.descr}`, () => {
			const sortedArr = [...testArr].sort(sortByStr(`${item.value}`));
			expect(sortedArr).toEqual(item.result);
		});
	});
});
