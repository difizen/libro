import { Module } from '@difizen/mana-app';

import { LibroPythonThemeContribution } from './libro-python-theme-contribution.js';

export const LibroE2ThemeModule = Module().register(LibroPythonThemeContribution);
