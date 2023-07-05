import { getIdFromQueryStr } from '../src/js/js-parts/actions/_helpers';
// function getIdFromQueryStr(queryStr) {
// 	console.log(queryStr);
// 	const match = queryStr.match(/id=(.+)/);
// 	if (match) return match[1];
// }
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
