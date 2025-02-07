import { Module } from '@difizen/libro-common/mana-app';

import { SqlContribution } from './sql-contribution.js';

export const SQLLanguageFeature = Module().register(SqlContribution);
