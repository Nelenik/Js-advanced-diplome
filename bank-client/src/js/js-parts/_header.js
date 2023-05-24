import { el, mount } from 'redom';
import { routes } from './_routes';
import { router } from '../index.js';
// вставляем инлайново свг
import logo from '!!svg-inline-loader!../../img/logo.svg';

/*
инициализация new Header({
  appContainer: el (контейнер куда вставляем элемент),
  enableMenu: def=false (указываем нужно ли отображать меню)
})
*/
export class Header {
	static mainMenuLinks = [];
	navLinksdata = [
		{ text: 'Банкоматы', route: routes.banks },
		{ text: 'Счета', route: routes.accounts },
		{ text: 'Валюта', route: routes.currencies },
		{ text: 'Выйти', route: routes.auth },
	];

	constructor(options) {
		const { appContainer, enableMenu = false } = options;
		this.appContainer = appContainer;
		this.header = el('header.header');
		this.container = el('.container.header__container');
		const logoLink = el('a.header__logo', { href: '#!' });
		logoLink.innerHTML = logo;
		mount(this.container, logoLink);
		this.createNav();
		mount(this.header, this.container);
		mount(this.appContainer, this.header);
		this.enableMenu = enableMenu;
	}

	createNav() {
		this.nav = el('nav.header__nav');

		this.navLinksdata.map((item) => {
			const link = el('a.header__link', { href: item.route }, item.text);
			Header.mainMenuLinks.push(link);

			window.addEventListener('load', () => {
				this.switchActiveLink(link, item.route);
			});
			window.addEventListener('popstate', () => {
				this.switchActiveLink(link, item.route);
			});
			link.addEventListener('click', (e) => {
				e.preventDefault();
				router.navigate(item.route);
				this.switchActiveLink(link, item.route);
			});
			mount(this.nav, link);
		});
		mount(this.container, this.nav);
	}
	// переключаем стили активной ссылки
	switchActiveLink(link, route) {
		const isExit = link.textContent === 'Выйти';
		if (window.location.pathname === route && !isExit) {
			Header.mainMenuLinks.forEach((el) =>
				el.classList.remove('header__link--active')
			);
			link.classList.add('header__link--active');
		}
	}

	set enableMenu(value) {
		this._enableMenu = value;
		if (value) {
			this.nav.classList.remove('header__nav--hidden');
		} else this.nav.classList.add('header__nav--hidden');
	}

	get enableMenu() {
		return this._enableNav;
	}
}
