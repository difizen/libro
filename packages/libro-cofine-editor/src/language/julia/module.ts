import { Module } from '@difizen/libro-common/mana-app';

import { JuliaContribution } from './julia-contribution.js';

export const JuliaLanguageFeature = Module().register(JuliaContribution);
