import { Module } from '@difizen/libro-common/mana-app';

import { JsonContribution } from './json-contribution.js';

export const JSONLanguageFeature = Module().register(JsonContribution);
