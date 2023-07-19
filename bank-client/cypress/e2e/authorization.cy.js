/* eslint-disable jest/expect-expect */
/// <reference types="cypress" />
Cypress.Commands.add('authorizate', (login, password) => {
	cy.visit('/');
	cy.get('[name="authLogin"]').type(login);
	cy.get('[name="authPassword"]').type(password);
	cy.get('[name="authForm"]').submit();
});
describe('Check authorization and new account creating', () => {
	beforeEach(() => {
		cy.authorizate('developer', 'skillbox');
	});
	it('should be authorizied', () => {
		cy.window().its('sessionStorage.token').should('exist');
	});
	it('should be "/accounts" in url', () => {
		cy.url().should('include', '/accounts');
	});
	it('should create new account', () => {
		cy.get('.counts-page__counts')
			.children()
			.its('length')
			.then((initLength) => {
				cy.get('.counts-page__new-count').click();
				cy.get('.counts-page__counts')
					.children()
					.its('length')
					.should('be.greaterThan', initLength);
			});
	});
});

function getToken() {
	return cy.window().its('sessionStorage.token');
}

function getAccounts() {
	return getToken().then((token) => {
		return cy
			.request({
				method: 'GET',
				url: 'http://localhost:3000/accounts',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Basic ${token}`,
				},
			})
			.then(({ body }) => {
				const { payload } = JSON.parse(body);
				return payload;
			});
	});
}

function transfer(from, to) {
	getToken().then((token) => {
		cy.request({
			method: 'POST',
			url: 'http://localhost:3000/transfer-funds',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${token}`,
			},
			body: {
				from: from,
				to: to,
				amount: 200,
			},
		}).then((res) => {
			cy.wrap(res.status).should('eq', 200);
		});
	});
}
describe('Check transaction', () => {
	beforeEach(() => {
		cy.authorizate('developer', 'skillbox');
	});
	it('should work transaction between the own accounts of user', () => {
		getAccounts().then((counts) => {
			if (counts.length < 2) {
				cy.log('There are not enough accounts to perform a transfer');
				return;
			}
			const fromAccount = counts[0].account;
			const toAccount = counts[1].account;
			transfer(fromAccount, toAccount);
		});
	});
	it('should work transactions to other existing accounts', () => {
		getAccounts().then((counts) => {
			const fromAccount = counts[0].account;
			const toAccount = '61253747452820828268825011';
			transfer(fromAccount, toAccount);
		});
	});
});
