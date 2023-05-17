import { el, mount, setChildren } from 'redom';
import { request, router } from '..';
import eye from '!!svg-inline-loader!../../img/eye.svg';
import eyeCrossed from '!!svg-inline-loader!../../img/eye-crossed.svg';

export function authPage(main) {
	mount(
		main,
		el(
			'.container.auth-page',
			el('.auth-page__form-wrap', [
				el('h1.auth-page__title', 'Вход в аккаунт'),
				createForm(),
			])
		)
	);
}

function createForm() {
	const form = el('form.auth-page__form.auth-form', {
		name: 'authForm',
		autocomplete: 'off',
	});
	// создаем поля формы
	const fields = ['Логин', 'Пароль'].map((item) => {
		let isPassword = item === 'Пароль';
		const label = el('label.auth-form__label', [
			el('span', item),
			el('input.auth-form__field', {
				type: isPassword ? 'password' : 'text',
				name: isPassword ? 'authPassword' : 'authLogin',
			}),
		]);
		// если поле пароля создаем и обрабатываем показ/сокрытие пароля
		if (isPassword) {
			const showPasswordBtn = el('button.btn-reset.show-password-btn', {
				type: 'button',
				id: 'showPassword',
			});
			showPasswordBtn.innerHTML = eye + eyeCrossed;
			mount(label, showPasswordBtn);
			const passwordInput = label.querySelector('input');
			const btnActiveClass = 'show-password-btn--visible';
			passwordInput.addEventListener('input', (e) => {
				if (e.currentTarget.value) {
					showPasswordBtn.classList.add(btnActiveClass);
				} else {
					showPasswordBtn.classList.remove(btnActiveClass);
				}
			});
			showPasswordBtn.addEventListener(
				'click',
				switchPasswordVisibility(passwordInput)
			);
		}
		return label;
	});

	const sbmtBtn = el(
		'button.btn-reset.blue-btn.blue-btn--sm.auth-form__sbmt-btn',
		'Войти'
	);
	setChildren(form, [...fields, sbmtBtn]);

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		request
			.login({ login: form.authLogin.value, password: form.authPassword.value })
			.then(() => {
				router.navigate('/accounts');
				document
					.querySelector(`.header__link[href*="/accounts"`)
					.classList.add('header__link--active');
			});
	});
	return form;
}

function switchPasswordVisibility(input) {
	return function (e) {
		const icons = e.currentTarget.querySelectorAll('.eye');
		input.type = input.type === 'password' ? 'text' : 'password';

		icons.forEach((el) => el.classList.toggle('eye--visible'));
	};
}
