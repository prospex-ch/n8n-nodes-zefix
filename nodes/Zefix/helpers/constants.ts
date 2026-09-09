/** Shared constants: the host, pacing, and the canton list. */

import { version } from '../../../package.json';

export const ZEFIX_BASE_URL = 'https://www.zefix.admin.ch/ZefixPublicREST/api/v1';

export const ZEFIX_MIN_INTERVAL_MS = 500;
export const ZEFIX_MAX_ATTEMPTS = 3;
export const ZEFIX_TIMEOUT_MS = 30_000;

/** The 26 cantons, keyed by the two-letter code the register publishes. */
export const CANTONS: Array<{ name: string; value: string }> = [
	{ name: 'Aargau', value: 'AG' },
	{ name: 'Appenzell Ausserrhoden', value: 'AR' },
	{ name: 'Appenzell Innerrhoden', value: 'AI' },
	{ name: 'Basel-Landschaft', value: 'BL' },
	{ name: 'Basel-Stadt', value: 'BS' },
	{ name: 'Bern', value: 'BE' },
	{ name: 'Fribourg', value: 'FR' },
	{ name: 'Geneva', value: 'GE' },
	{ name: 'Glarus', value: 'GL' },
	{ name: 'Graubünden', value: 'GR' },
	{ name: 'Jura', value: 'JU' },
	{ name: 'Lucerne', value: 'LU' },
	{ name: 'Neuchâtel', value: 'NE' },
	{ name: 'Nidwalden', value: 'NW' },
	{ name: 'Obwalden', value: 'OW' },
	{ name: 'Schaffhausen', value: 'SH' },
	{ name: 'Schwyz', value: 'SZ' },
	{ name: 'Solothurn', value: 'SO' },
	{ name: 'St. Gallen', value: 'SG' },
	{ name: 'Thurgau', value: 'TG' },
	{ name: 'Ticino', value: 'TI' },
	{ name: 'Uri', value: 'UR' },
	{ name: 'Valais', value: 'VS' },
	{ name: 'Vaud', value: 'VD' },
	{ name: 'Zug', value: 'ZG' },
	{ name: 'Zürich', value: 'ZH' },
];

/** Sent on every request so an operator reading their logs knows who to contact. */
export const USER_AGENT = `n8n-nodes-zefix/${version} (+https://github.com/prospex-ch/n8n-nodes-zefix)`;
