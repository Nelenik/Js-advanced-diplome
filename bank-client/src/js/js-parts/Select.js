import { el, setChildren } from 'redom';
/*
Простой селект, единичный выбор построен на базе радиокнопок, в качестве аргументов принимает:
options: {
  selectContent: [
    { text: 'По номеру', value: 'account', name: 'sort' },
      { text: 'По балансу', value: 'balance', name: 'sort' },
      { text: 'По последней транзакции', value: 'transactions.0.date', name: 'sort' },
  ],
  onChange: (radiobtn)=>{},(срабатывает при переключении)
  onOpen: (instance)=>{}
  onClose: (instance)=>{}
}
методы вставки:
inst.appendAt(target) - target -это элемент в который вставляем селект, в конец
inst.prependAt(target)- target -это элемент в который вставляем селект в начало
зависим от библиотеки redom
*/

export class Select {
	constructor(options) {
		const {
			selectContent,
			onChange = () => {},
			onOpen = () => {},
			onClose = () => {},
		} = options;
		this.selectContent = selectContent;
		this.onChange = onChange;
		this.onOpen = onOpen;
		this.onClose = onClose;
		this.select = el('div.select');
		this.button = el(
			'button.btn-reset.select__btn',
			{ type: 'button', 'aria-label': 'Сортировка счетов' },
			'Сортировка'
		);
		this.dropdown = el('div.select__dropdown');
		this.radioWrap = this.selectContent.map((item) => {
			const radioBtn = el('input.select__def-radio', {
				type: 'radio',
				value: item.value,
				name: item.name,
			});
			radioBtn.addEventListener('change', async (e) => {
				const target = e.currentTarget;
				if (target.checked) {
					this.isChecked = target;
					this.isOpen = false;
					await this.onChange(target);
				}
			});
			return el('label.select__choice', [
				radioBtn,
				el('span.select__choice-text', item.text),
			]);
		});
		setChildren(this.dropdown, this.radioWrap);
		setChildren(this.select, [this.button, this.dropdown]);
		this.isOpen = false;
		this.radioBtns = [...this.dropdown.querySelectorAll('input[type="radio"]')];
		this.isChecked;
		this.button.addEventListener('click', this.toggleDropdown.bind(this));
		this.button.addEventListener('keydown', this.keyboardNavigation.bind(this));
		document.addEventListener('keydown', (e) => {
			if (this.isOpen) {
				if (e.code === 'Tab') {
					e.preventDefault();
					this.isOpen = false;
				}
				if (e.code === 'Escape') {
					this.isOpen = false;
				}
			}
		});
	}

	set isOpen(value) {
		this._isOpen = value;
		value ? this.openDropdown() : this.closeDropdown();
	}

	get isOpen() {
		return this._isOpen;
	}

	toggleDropdown() {
		this.isOpen = !this.isOpen;
	}

	keyboardNavigation(e) {
		if (e.code === 'ArrowDown') {
			if (!this.isOpen) {
				this.isOpen = true;
			} else if (this.isChecked) {
				this.isChecked.focus();
			} else {
				const firstRadio = this.radioBtns[0];
				firstRadio.focus();
				firstRadio.click();
			}
		}
	}

	openDropdown() {
		this.onOpen(this);
		this.dropdown.classList.add('select__dropdown--js-shown');
		this.select.classList.add('select--active');
		this.button.setAttribute('aria-expanded', true);
	}

	closeDropdown() {
		this.onClose(this);
		this.button.focus();
		this.dropdown.classList.remove('select__dropdown--js-shown');
		this.select.classList.remove('select--active');
		this.button.setAttribute('aria-expanded', false);
	}

	appendAt(target) {
		target.append(this.select);
	}
	prependAt(target) {
		target.prepend(this.select);
	}
}
