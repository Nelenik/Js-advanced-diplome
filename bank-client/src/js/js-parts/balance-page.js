import { el, mount, setChildren } from 'redom';
import { routes } from './actions/_routes';
import { request, router } from '..';
import {
	BalancePerPeriod,
	redirectOnExipredSession,
	wait,
	LS,
	resetPage,
} from './actions/_helpers';
import { Table } from './classes/Table';
import { setBalanceDynamicChart } from './actions/_charts';

export function balancePage(main, countId) {
	resetPage(main);
}
