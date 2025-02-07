import { Module } from '@difizen/libro-common/app';

import { SqlContribution } from './sql-contribution.js';

export const SQLLanguageFeature = Module().register(SqlContribution);
