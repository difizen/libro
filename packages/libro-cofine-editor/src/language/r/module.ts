import { Module } from '@difizen/libro-common/app';

import { RContribution } from './r-contribution.js';

export const RLanguageFeature = Module().register(RContribution);
