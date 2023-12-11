import { Module } from '@difizen/mana-app';

import { PythonContribution } from './python-language-feature.js';

export const PythonLanguageFeature = Module().register(PythonContribution);
