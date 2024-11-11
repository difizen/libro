import { Module } from '@difizen/mana-app';

import { JsonContribution } from './json-contribution';

export const JSONLanguageFeature = Module().register(JsonContribution);
