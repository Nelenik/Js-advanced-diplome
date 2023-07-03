import { el, mount, setChildren } from 'redom';
import { routes } from './actions/_routes';
import { request, router } from '..';
import { resetPage, Validate } from './actions/_helpers';
import eyeSvg from '!!svg-inline-loader!../../img/eye.svg';
import eyeCrossedSvg from '!!svg-inline-loader!../../img/eye-crossed.svg';

export function authPage(main) {
	resetPage(main, false);
	mount(
		main,
		el(
			'.container.auth-page',
			el('.auth-page__form-wrap', [
				el('h1.auth-page__title.title.title--lg', 'Вход в аккаунт'),
				createForm(),
			])
		)
	);
}
// переменные экземпляров валидации полей логин и пароль
let loginValid;
let passValid;

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
			showPasswordBtn.innerHTML = eyeSvg + eyeCrossedSvg;
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
	// инициализируем валидацию полей формы авторизации
	loginValid = new Validate(form.authLogin);
	passValid = new Validate(form.authPassword);

	form.addEventListener('submit', authFormHandler);
	return form;
}

// переключение видимости пароля
function switchPasswordVisibility(input) {
	return function (e) {
		const icons = e.currentTarget.querySelectorAll('.eye');
		input.type = input.type === 'password' ? 'text' : 'password';

		icons.forEach((el) => el.classList.toggle('eye--visible'));
	};
}
// обработчик сабмита формы авторизации

function authFormHandler(e) {
	e.preventDefault();
	const target = e.currentTarget;
	request
		.login({
			login: target.authLogin.value,
			password: target.authPassword.value,
		})
		.then(() => {
			router.navigate(routes.accounts);
			document
				.querySelector(`.header__link[href*="${routes.accounts}"`)
				.classList.add('header__link--active');
		})
		.catch((err) => {
			loginValid.success = true;
			passValid.success = true;
			switch (err.message) {
				case 'No such user':
					loginValid.showMessage('Неверный логин', 'error');
					break;
				case 'Invalid password':
					passValid.showMessage('Неверный пароль', 'error');
					break;
				default:
					throw err;
			}
		});
}
