import { Module } from '@difizen/mana-app';

import { LSPContribution } from './lsp-contribution.js';

export const LSPFeatureModule = Module().register(LSPContribution);
