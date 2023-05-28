import { el, setChildren } from 'redom';
/*
Простой селект, единичный выбор, поиск, автодополнение, построен на базе группы радиокнопок (нужна именно группа с одинаковым name, для правильной навигации), в качестве аргументов принимает:
const mySelect = new Select(options);
--options: {
  selectContent: [
    { text: 'По номеру', value: 'account', name: 'sort' },
      { text: 'По балансу', value: 'balance', name: 'sort' },
      { text: 'По последней транзакции', value: 'transactions.0.date', name: 'sort' },
  ],
  onChange: (instance, radioBtnValue)=>{},(получает экземпляр и значение радиокнопки)
  onOpen: (instance)=>{},
  onClose: (instance)=>{},
  onInput: (instance, inputValue)=>{},(работает с triggerType: 'text', при вводе в инпут, получает экземпляр и значение инпута)
  additionalClass: 'some-class',(доп. класс добавляется к обертке селекта, полезно при стилизации разных селектов)
  placeholderText: 'some-text',(название списка),
  toChangePlaceholder: true(def), (нужно ли изменять плейсхолдер при выборе)
  triggerType: 'button'(def), (тип дропдауна, если нужно текстовое поле с автодополнением нужно указать 'text')
}
--методы вставки:
inst.appendEl(target) - target -это элемент в который вставляем селект, в конец
inst.prependEl(target)- target -это элемент в который вставляем селект в начало

--доступные свойства
mySelect.selectValue - получить значение селекта/инпута
mySelect.isOpen = true/false - открывает закрвает дропдаун
mySelect.selectContent = массив со значениями радиокнопок: { text: 'По номеру', value: 'account', name: 'sort' }, можно передать его позже

--зависим от библиотеки redom
--нужно быть осторожным с полем 'name' для других элементов формы, чтобы не было конфликта, также при использовании FormData полученный объект нужно будет отредактировать вручную, т.к. радиокнопка туда попадет.
*/

export class Select {
	constructor(options) {
		const {
			selectContent,
			onChange = () => {},
			onOpen = () => {},
			onClose = () => {},
			onInput = () => {},
			additionalClass = '',
			placeholderText = '',
			toChangePlaceholder = true,
			triggerType = 'button',
		} = options;

		this.onChange = onChange;
		this.onOpen = onOpen;
		this.onClose = onClose;
		this.onInput = onInput;
		this.additionalClass = additionalClass;
		this.placeholderText = placeholderText;
		this.toChangePlaceholder = toChangePlaceholder;
		this.triggerType = triggerType;

		this.select = el(`div.select.${this.additionalClass}`);

		// триггер кнопка
		this.selectTrigger = el('input.btn-reset.select__btn', {
			type: 'button',
			'aria-label': 'Открыть выпадающий список',
			value: this.placeholderText,
			name: 'selectTriggerBtn',
		});
		// триггер текстовый инпут для автозаполнения
		this.autocompleteInput = el('input.select__autocomplete', {
			type: 'text',
			placeholder: this.placeholderText,
			name: 'selectAutocomplete',
			value: '',
		});

		this.dropdown = el('div.select__dropdown');
		this.selectContent = selectContent;
		setChildren(this.select, [
			this.isSelect() ? this.selectTrigger : this.autocompleteInput,
			this.dropdown,
		]);
		this.isOpen = false;
		this.isChecked = null;
		this.selectValue = '';

		this.autocomplHandlers();
		this.selectTriggerHandlers();
		this.docHandlers();
	}

	set selectContent(value) {
		this._selectContent = value;
		this.radioWrap = value?.map((item) => {
			const radioBtn = el('input.select__def-radio', {
				type: 'radio',
				value: item.value,
				name: item.name,
			});
			const radioLabel = el('label.select__item');
			setChildren(radioLabel, [
				radioBtn,
				el('span.select__item-text', item.text),
			]);
			this.radioHandlers(radioBtn, item);
			return radioLabel;
		});
		setChildren(this.dropdown, this.radioWrap);
		this.radioBtns = [...this.dropdown.querySelectorAll('input[type="radio"]')];
	}

	get selectContent() {
		return this._selectContent;
	}

	set isOpen(value) {
		this._isOpen = value;
		value ? this.openDropdown() : this.closeDropdown();
	}

	get isOpen() {
		return this._isOpen;
	}
	// проверяем тип select vs autocomplete
	isSelect() {
		if (this.triggerType === 'button') {
			return true;
		} else if (this.triggerType === 'text') {
			return false;
		} else {
			throw new Error('The triggerType setting should be "button" or "text"');
		}
	}
	//функции с обработчиками по элементам
	radioHandlers(radioBtn, selectContentItem) {
		radioBtn.addEventListener('click', async (e) => {
			const target = e.currentTarget;
			if (e.clientX && e.clientY) {
				this.isOpen = false;
				await this.onChange(target.value);
			}
		});

		radioBtn.addEventListener('keyup', async (e) => {
			const target = e.currentTarget;
			if (e.key === 'Enter' || e.key === 'Return') {
				this.isOpen = false;
				await this.onChange(target.value);
			}
		});

		radioBtn.addEventListener('change', (e) => {
			const target = e.currentTarget;
			if (target.checked) {
				this.isChecked = target;
				this.selectValue = target.value;
				if (this.toChangePlaceholder) {
					if (this.isSelect()) {
						this.selectTrigger.value = selectContentItem.text;
					} else this.autocompleteInput.value = selectContentItem.text;
				}
			}
		});
	}

	selectTriggerHandlers() {
		this.selectTrigger.addEventListener('click', () => {
			this.isOpen = !this.isOpen;
		});
		this.selectTrigger.addEventListener(
			'keydown',
			this.btnKeydownHandler.bind(this)
		);
	}
	autocomplHandlers() {
		this.autocompleteInput.addEventListener('input', (e) => {
			this.isChecked = null;
			this.onInput(this, e.currentTarget.value);
		});
		this.autocompleteInput.addEventListener(
			'keydown',
			this.btnKeydownHandler.bind(this)
		);
	}

	docHandlers() {
		document.addEventListener('keydown', this.docKeydownHandler.bind(this));
		document.addEventListener('click', (e) => {
			if (!e.target.closest('.select') && this.isOpen) this.isOpen = false;
		});
	}

	btnKeydownHandler(e) {
		if (e.code === 'ArrowDown') {
			e.preventDefault();
			if (!this.isOpen) {
				if (this.isSelect()) {
					this.isOpen = true;
				} else return;
			} else if (this.isChecked) {
				this.isChecked.focus();
			} else {
				const firstRadio = this.radioBtns[0];
				firstRadio.focus();
				firstRadio.click();
			}
		}
	}

	docKeydownHandler(e) {
		if (this.isOpen) {
			if (e.code === 'Tab') {
				e.preventDefault();
				this.isOpen = false;
			}
			if (e.code === 'Escape') {
				this.isOpen = false;
			}
		}
	}

	openDropdown() {
		this.onOpen(this);
		this.dropdown.classList.add('select__dropdown--js-shown');
		this.select.classList.add('select--active');
		if (this.isSelect()) {
			this.selectTrigger.setAttribute('aria-expanded', true);
		} else {
			this.autocompleteInput.setAttribute('aria-expanded', true);
		}
	}

	closeDropdown() {
		this.onClose(this);
		if (this.isSelect()) {
			this.selectTrigger.focus();
			this.selectTrigger.setAttribute('aria-expanded', false);
		} else {
			this.autocompleteInput.focus();
			this.autocompleteInput.setAttribute('aria-expanded', false);
		}
		this.dropdown.classList.remove('select__dropdown--js-shown');
		this.select.classList.remove('select--active');
	}

	appendAt(target) {
		target.append(this.select);
	}
	prependAt(target) {
		target.prepend(this.select);
	}
	reset() {
		this.selectValue = '';
		this.isChecked.checked = false;
		this.isChecked = null;
		if (this.isSelect()) {
			this.selectTrigger.value = this.placeholderText;
		} else {
			this.autocompleteInput.value = '';
		}
	}
}
