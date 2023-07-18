/// <reference types="cypress" />

describe('Checking authorization', () => {
	beforeEach(() => {
		cy.visit('/');
	});
	it('Authorization', () => {
		cy.get('[name="authLogin"]').type('developer');
		cy.get('[name="authPassword"]').type('skillbox');
		cy.get('[name="authForm"]').submit();
		cy.request('POST', 'http://localhost/3000/login', {
			login: 'developer',
			password: 'skillbox',
		});
	});
});
