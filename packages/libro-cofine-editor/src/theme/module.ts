import { Module } from '@difizen/libro-common/mana-app';

import { LibroPythonThemeContribution } from './libro-python-theme-contribution.js';

export const LibroE2ThemeModule = Module().register(LibroPythonThemeContribution);
