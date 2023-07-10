import { sortByProp } from '../src/js/js-parts/actions/_helpers';

// sortByProp test
describe('Checking sorting by prop in a array of objects with nested objects', () => {
	const arrOfObj = [
		{
			name: 'Pete',
			age: 16,
			birthDay: '2007.04.16',
			pets: [{ dog: 'Jack' }, { cat: 'Nancy' }],
			friend: 'Mike',
		},
		{
			name: 'Nick',
			age: 45,
			birthDay: '1978.12.16',
			pets: [{ dog: 'Bibo' }, { cat: 'Alice' }],
		},
		{
			name: 'Tania',
			age: 20,
			birthDay: '2003.01.26',
			pets: [{ dog: 'Polly' }],
			friend: 'Miriam',
		},
	];
	const testValues = [
		{
			descr: 'Sorting by first level props, prop value is str',
			value: 'name',
			result: [
				{
					name: 'Nick',
					age: 45,
					birthDay: '1978.12.16',
					pets: [{ dog: 'Bibo' }, { cat: 'Alice' }],
				},
				{
					name: 'Pete',
					age: 16,
					birthDay: '2007.04.16',
					pets: [{ dog: 'Jack' }, { cat: 'Nancy' }],
					friend: 'Mike',
				},
				{
					name: 'Tania',
					age: 20,
					birthDay: '2003.01.26',
					pets: [{ dog: 'Polly' }],
					friend: 'Miriam',
				},
			],
		},
		{
			descr: 'Sorting by first level props, prop value is number',
			value: 'age',
			result: [
				{
					name: 'Pete',
					age: 16,
					birthDay: '2007.04.16',
					pets: [{ dog: 'Jack' }, { cat: 'Nancy' }],
					friend: 'Mike',
				},
				{
					name: 'Tania',
					age: 20,
					birthDay: '2003.01.26',
					pets: [{ dog: 'Polly' }],
					friend: 'Miriam',
				},
				{
					name: 'Nick',
					age: 45,
					birthDay: '1978.12.16',
					pets: [{ dog: 'Bibo' }, { cat: 'Alice' }],
				},
			],
		},
		{
			descr: 'Sorting by first level props, prop value is date str',
			value: 'birthDay',
			result: [
				{
					name: 'Nick',
					age: 45,
					birthDay: '1978.12.16',
					pets: [{ dog: 'Bibo' }, { cat: 'Alice' }],
				},
				{
					name: 'Tania',
					age: 20,
					birthDay: '2003.01.26',
					pets: [{ dog: 'Polly' }],
					friend: 'Miriam',
				},
				{
					name: 'Pete',
					age: 16,
					birthDay: '2007.04.16',
					pets: [{ dog: 'Jack' }, { cat: 'Nancy' }],
					friend: 'Mike',
				},
			],
		},
		{
			descr: 'If not all objects have a property that we sort by ',
			value: 'friend',
			result: [
				{
					name: 'Pete',
					age: 16,
					birthDay: '2007.04.16',
					pets: [{ dog: 'Jack' }, { cat: 'Nancy' }],
					friend: 'Mike',
				},
				{
					name: 'Tania',
					age: 20,
					birthDay: '2003.01.26',
					pets: [{ dog: 'Polly' }],
					friend: 'Miriam',
				},
				{
					name: 'Nick',
					age: 45,
					birthDay: '1978.12.16',
					pets: [{ dog: 'Bibo' }, { cat: 'Alice' }],
				},
			],
		},
		{
			descr: 'Sorting by props of nested objects',
			value: 'pets.0.dog',
			result: [
				{
					name: 'Nick',
					age: 45,
					birthDay: '1978.12.16',
					pets: [{ dog: 'Bibo' }, { cat: 'Alice' }],
				},
				{
					name: 'Pete',
					age: 16,
					birthDay: '2007.04.16',
					pets: [{ dog: 'Jack' }, { cat: 'Nancy' }],
					friend: 'Mike',
				},
				{
					name: 'Tania',
					age: 20,
					birthDay: '2003.01.26',
					pets: [{ dog: 'Polly' }],
					friend: 'Miriam',
				},
			],
		},
	];
	testValues.forEach((item) => {
		test(`${item.descr}`, () => {
			const sortedArr = [...arrOfObj].sort(sortByProp(`${item.value}`));
			expect(sortedArr).toEqual(item.result);
		});
	});
});
