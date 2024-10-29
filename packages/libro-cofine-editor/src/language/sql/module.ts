import { Module } from '@difizen/mana-app';

import { SqlContribution } from './sql-contribution.js';

export const SQLLanguageFeature = Module().register(SqlContribution);
