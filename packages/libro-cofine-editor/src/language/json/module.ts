import { Module } from '@difizen/mana-app';

import { JsonContribution } from './json-contribution.js';

export const JSONLanguageFeature = Module().register(JsonContribution);
