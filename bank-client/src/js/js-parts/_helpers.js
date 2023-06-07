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
/*******************************************************/
/*
Утилита `GetIndex.index` выполняет бинарный поиск в отсортированном массиве и возвращает индекс элемента, удовлетворяющего заданному условию сравнения.
Использование: GetIndex.index(array, compare)
  - `array`: Отсортированный массив, в котором будет выполняться поиск.
  - `compare`: Функция обратного вызова (callback), которая принимает два параметра:
    - `arr`: Ссылка на массив.
    - `middle`: Индекс среднего элемента.
  - Возвращает индекс элемента, удовлетворяющего условию в функции `compare`.

Ограничения функции обратного вызова (compare):
  - Функция `compare` должна возвращать логическое значение, определяющее положение искомого элемента в массиве.
  - Ожидается, что функция `compare` будет использовать определенную логику для сравнения среднего элемента (arr[middle]) с искомым элементом.
  - Если искомый элемент находится в правой половине массива, функция `compare` должна вернуть `true`. В противном случае, она должна вернуть `false`.
  - Если функция `compare` возвращает логическое значение, которое не основано на сравнении среднего элемента с искомым элементом, результаты поиска могут быть непредсказуемыми или неверными.

Возвращаемые значения:
  - Если искомый элемент не существует в массиве, возвращается индекс первого существующего элемента по возрастанию.
  - Если полученный индекс больше индекса крайнего правого элемента, возвращается -1.
  - Если полученный индекс меньше индекса крайнего левого элемента, возвращается 0.
*/
export class GetIndex {
	static index(arr, compare = () => {}) {
		let left = 0;
		let right = arr.length - 1;
		let compareRes;
		while (left <= right) {
			let middle = Math.floor((left + right) / 2);
			compareRes = compare(arr, middle);
			if (typeof compareRes !== 'boolean') {
				throw new TypeError('Callback should return boolean');
			} else if (compareRes) {
				left = middle + 1;
			} else {
				right = middle - 1;
			}
		}
		return left > arr.length - 1 ? -1 : left;
	}
}
