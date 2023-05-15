import { el, mount, unmount } from 'redom';
import logo from '../../img/logo.svg';

export class Header {
	navBtnsData = [
		{ text: 'Банкоматы', route: '/banks' },
		{ text: 'Счета', route: '/accounts' },
		{ text: 'Валюта', route: '/currencies' },
		{ text: 'Выйти', route: '/' },
	];

	constructor(appContainer, nav = false) {
		this.appContainer = appContainer;
		this.header = el('header.header');
		this.container = el(
			'.container.header__container',
			el(
				'a.header__logo',
				{ href: '#!' },
				el('img.header__logo-img', { src: logo })
			)
		);
		mount(this.header, this.container);
		mount(this.appContainer, this.header);
		this.enableNav = nav;
	}

	set enableNav(value) {
		if (this.nav) unmount(this.container, this.nav);
		this._enableNav = value;
		if (value) {
			this.nav = el('nav.header__nav');

			this.navBtnsData.map((item) => {
				const link = el(
					'a.header__link',
					{ href: item.route, 'data-navigo': '' },
					item.text
				);
				if (window.location.pathname === item.route) {
					link.classList.add('header__link--active');
				}
				link.addEventListener('click', (e) => {
					e.preventDefault();
					if (window.location.pathname === item.route) {
						link.classList.add('header__link--active');
					}
				});

				mount(this.nav, link);
			});
			mount(this.container, this.nav);
		}
	}

	get enableNav() {
		return this._enableNav;
	}
}
