import { el, mount, setChildren } from 'redom';

/* Класс Pagination
Класс Pagination представляет компонент пагинации. Он содержит различные CSS-классы для стилизации элементов пагинации. При создании экземпляра класса можно настроить количество страниц, текущую страницу, видимые кнопки слева и справа от текущей страницы, наличие многоточия, внешний вид кнопок управления и другие параметры. Класс обеспечивает отображение кнопок пагинации, их обновление при изменении текущей страницы, а также обработку событий клика на кнопки. Зависимо от библиотеки redom. ее установить можно по CDN: '<script src="https://unpkg.com/redom@3.29.1/dist/redom.js"></script>' или через NPM: 'npm install redom'.
Инициализцаия: new Pagination(target, options)
-- target - элемент в который вставим блок пагинации;
-- options: {
  pages: def(1), - количество страниц, обязательный параметр
  initial: def(1), - изначально активная страница, дефолтное значение - 1
  visibleAtLeft: def(2) - количество видимых слева от текущей кнопок
  visibleAtRight: def(2) - количество видимых справа от текущей кнопок
  ellipsis: def(false) - нужно ли многоточие,
  controls: {
      startEnd: { - кнопки на первую и посленюю страницу
        enable: false, -нужны/не нужны
        startInner: '', содержимое строка, можно в виде Html: '<img src="some.jpg">'
        endInner: '',
      },
      prevNext: { - конопки предыдущая и следующая
        enable: true, - нужны/не нужны
        prevInner: 'ᐸ', - содержимое, строка.
        nextInner: 'ᐳ',
      }
    },
  controlState: def('disable')||'hide' - скрывать или делать неактивными предыдущую и следующую кнопки в конце и начале,
  additionalClass: '',
  customBtnInner: (num)=>{} - функция должна возвращать html в виде строки. принимает параметр num. это номер кнопки пагинации.
  onClick: (num)=>{}
}

Свойства: instance.current - можно передать номер страницы, чтобы переключить вручную
*/

export class Pagination {
	CSS = {
		mainWrapperClass: 'pagination',
		btnsWrapperClass: 'pagination__wrapper',
		btnClass: 'pagination__btn',
		ellipsisClass: 'pagination__ellipsis',
		leftControlsClass: 'pagination__controls.pagination__controls--left',
		rightControlsClass: 'pagination__controls.pagination__controls--right',
		prevClass: 'pagination__control.pagination__control--prev',
		nextClass: 'pagination__control.pagination__control--next',
		startClass: 'pagination__control.pagination__control--start',
		endClass: 'pagination__control.pagination__control--end',
		disabledClass: 'pagination__control--disabled',
		currentClass: 'pagination__btn--current',
	};

	constructor(target, options) {
		const defaults = {
			pages: 1,
			initial: 1,
			visibleAtLeft: 2,
			visibleAtRight: 2,
			ellipsis: false,
			customBtnInner: () => {},
			onClick: () => {},
			controls: {
				startEnd: {
					enable: false,
					startInner: '',
					endInner: '',
				},
				prevNext: {
					enable: true,
					prevInner: 'ᐸ',
					nextInner: 'ᐳ',
				},
			},
			controlsState: 'disable',
			additClass: '',
		};
		this.target = target;
		this.options = { ...defaults, ...options };
		this.onClick = this.options.onClick;
		this.pages = Number(this.options.pages);
		this.mainWrapper = el(
			`div.${this.CSS.mainWrapperClass}.${this.options.additClass}`
		);
		mount(this.target, this.mainWrapper);
		this.current = this.options.initial;
	}

	set current(value) {
		//при смене текущщего номера перерисовываются кнопки
		this._current = value;
		this.renderPagBlock();
	}

	get current() {
		return this._current;
	}

	//отрисовываем кнопки
	renderPagBlock() {
		this.mainWrapper.innerHTML = '';
		const { leftControls, rightControls } = this.getControls();
		const pagBtnsArr = this.getBtnsArr();
		setChildren(this.mainWrapper, [
			leftControls,
			el(`div.${this.CSS.btnsWrapperClass}`, pagBtnsArr),
			rightControls,
		]);
		this.mainWrapper.querySelector(`.${this.CSS.currentClass}`).focus();
	}
	//создаем массив с кнопками пагинации
	getBtnsArr() {
		let { visibleAtLeft, visibleAtRight, ellipsis } = this.options;
		let btns = [];
		visibleAtRight = Number(visibleAtRight);
		visibleAtLeft = Number(visibleAtLeft);
		const maxCountOfVisible = visibleAtLeft + visibleAtRight + 1;

		if (this.pages <= maxCountOfVisible)
			btns = Array.from({ length: this.pages }, (_, i) =>
				this.createBtn(i + 1)
			);
		else {
			//иначе вычисляем крайние видимые кнопки левую и правую
			let left = Math.max(this.current - visibleAtLeft, 1);
			let right = Math.min(this.current + visibleAtRight, this.pages);
			for (let i = left; i <= right; i++) {
				const btn = this.createBtn(i);
				btns.push(btn);
			}
			if (ellipsis) {
				if (left > 1) btns.unshift(this.createEllipsis());
				if (right < this.pages) btns.push(this.createEllipsis());
			}
		}

		return btns;
	}
	//функция создания  кнопки пагинации
	createBtn(num) {
		const { customBtnInner } = this.options;
		const { btnClass, currentClass } = this.CSS;
		const pagBtn = el(`a.${btnClass}`, {
			href: '#!',
			'data-pagin-page': `${num}`,
			'aria-label': `page ${num}`,
		});
		if (this.current === num) {
			pagBtn.classList.add(`${currentClass}`);
		}
		const inner = customBtnInner(num);
		if (inner && typeof inner !== 'string')
			throw new TypeError(
				'Function "customBtnInner()" must return Html in string format'
			);
		pagBtn.innerHTML = inner ? inner : num;

		pagBtn.addEventListener('click', this.btnsHandler.bind(this));
		return pagBtn;
	}
	// функция создания блока с многоточием
	createEllipsis() {
		return el(`span.${this.CSS.ellipsisClass}`, '...');
	}
	//создаем элементы управления (первая последняя следующая предыдущая)
	getControls() {
		const { controls } = this.options;
		const {
			leftControlsClass,
			rightControlsClass,
			prevClass,
			nextClass,
			startClass,
			endClass,
		} = this.CSS;
		const { startEnd, prevNext } = controls;

		const leftControlsArr = [],
			rightControlsArr = [];

		if (prevNext.enable) {
			const prev = this.current === 1 ? 1 : this.current - 1;
			const next = this.current === this.pages ? this.pages : this.current + 1;
			const prevEl = this.createCtrlBtn(
				prev,
				prevNext.prevInner,
				prevClass,
				'Предыдущая страница'
			);
			const nextEl = this.createCtrlBtn(
				next,
				prevNext.nextInner,
				nextClass,
				'Следующая страница'
			);
			leftControlsArr.push(prevEl);
			rightControlsArr.unshift(nextEl);
		}

		if (startEnd.enable) {
			const start = 1;
			const end = this.pages;
			const startEl = this.createCtrlBtn(
				start,
				startEnd.startInner,
				startClass,
				'Первая страница'
			);
			const endEl = this.createCtrlBtn(
				end,
				startEnd.endInner,
				endClass,
				'Последняя страница'
			);
			leftControlsArr.unshift(startEl);
			rightControlsArr.push(endEl);
		}
		const leftControls = el(`div.${leftControlsClass}`, leftControlsArr);
		const rightControls = el(`div.${rightControlsClass}`, rightControlsArr);
		return { leftControls, rightControls };
	}
	// функция создание кнопки управления
	createCtrlBtn(num, inner, ctrlClass, ariaLabel) {
		const ctrlBtn = el(`a.${ctrlClass}`, {
			href: '#!',
			'data-pagin-page': `${num}`,
			'aria-label': ariaLabel,
		});
		if (inner && typeof inner !== 'string')
			throw new TypeError(
				'The inner of controlBtns must be text or Html in string format'
			);
		ctrlBtn.innerHTML = inner;
		if (this.current === num) this.disableHideCtnrls(ctrlBtn);
		ctrlBtn.addEventListener('click', this.btnsHandler.bind(this));
		return ctrlBtn;
	}

	disableHideCtnrls(ctrlBtn) {
		const { controlsState } = this.options;
		const { disabledClass } = this.CSS;
		if (controlsState === 'disable') ctrlBtn.classList.add(`${disabledClass}`);
		else if (controlsState === 'hide') ctrlBtn.style.display = 'none';
		else return;
	}

	btnsHandler(e) {
		e.preventDefault();
		const target = e.currentTarget;
		const pageNum = Number(target.dataset.paginPage);
		this.onClick(pageNum);
		this.current = pageNum;
	}
}
