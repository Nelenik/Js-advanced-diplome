import { el, mount } from 'redom';
import { routes } from '../actions/_routes';
import { router } from '../../index.js';
// вставляем инлайново свг
import logo from '!!svg-inline-loader!../../../img/logo.svg';

/*
инициализация: new Header({
  appContainer: el (контейнер куда вставляем элемент),
  enableMenu: def=false (указываем нужно ли отображать меню)
})
методы:
-instance.switchActiveLinkState(pathName) - переключает активное состояние ссылки, получает в качетсве аргумента pathName, который можно указать явно если известен или взять из window.location.pathname;
-instance.removeActiveState - при необходимости снимает активное состояние у всех ссылок
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
		console.log(appContainer);
		this.appContainer = appContainer;
		this.header = el('header.header');
		this.container = el('.container.header__container');
		const logoLink = el('a.header__logo', { href: '#!' });
		logoLink.innerHTML = logo;
		mount(this.container, logoLink);
		this.createNav();
		mount(this.header, this.container);
		this.appContainer?.append(this.header);
		// mount(this.appContainer, this.header);
		this.enableMenu = enableMenu;

		window.addEventListener('popstate', () => {
			this.switchActiveLinkState(window.location.pathname);
		});
		window.addEventListener('load', () => {
			this.switchActiveLinkState(window.location.pathname);
		});
	}

	createNav() {
		this.nav = el('nav.header__nav');

		this.navLinksdata.map((item) => {
			const link = el(
				'a.header__link.link-reset',
				{ href: item.route },
				item.text
			);
			Header.mainMenuLinks.push(link);
			link.addEventListener('click', (el) => {
				el.preventDefault();
				router.navigate(item.route);
				this.switchActiveLinkState(item.route);
			});
			mount(this.nav, link);
		});
		mount(this.container, this.nav);
	}
	// переключаем стили активной ссылки
	switchActiveLinkState(pathName) {
		this.removeActiveState();
		if (pathName === '/') return;
		const regexp = new RegExp('^' + pathName + '$');
		const link = Header.mainMenuLinks.find((item) => {
			const hrefPathname = new URL(item.href).pathname;
			if (regexp.test(hrefPathname)) return item;
		});
		if (link) link.classList.add('header__link--active');
		// }
	}

	removeActiveState() {
		Header.mainMenuLinks.forEach((el) =>
			el.classList.remove('header__link--active')
		);
	}

	set enableMenu(value) {
		this._enableMenu = value;
		if (value) {
			this.nav.classList.remove('header__nav--hidden');
		} else this.nav.classList.add('header__nav--hidden');
	}

	get enableMenu() {
		return this._enableMenu;
	}
}
