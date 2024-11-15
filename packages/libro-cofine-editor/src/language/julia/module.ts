import { Module } from '@difizen/mana-app';

import { JuliaContribution } from './julia-contribution.js';

export const JuliaLanguageFeature = Module().register(JuliaContribution);
