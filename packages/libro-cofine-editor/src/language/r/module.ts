import { Module } from '@difizen/mana-app';

import { RContribution } from './r-contribution.js';

export const RLanguageFeature = Module().register(RContribution);
