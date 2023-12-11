import { Module } from '@difizen/mana-app';

import 'reflect-metadata';
import { PythonContribution } from './python-language-feature.js';

export * from './python-language-feature.js';
export const PythonModule = Module().register(PythonContribution);
export default PythonModule;
