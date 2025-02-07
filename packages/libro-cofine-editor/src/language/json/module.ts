import { Module } from '@difizen/libro-common/app';

import { JsonContribution } from './json-contribution.js';

export const JSONLanguageFeature = Module().register(JsonContribution);
