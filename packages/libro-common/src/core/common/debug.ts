import { debug as originDebug } from 'debug';

export const debug = originDebug('[core]');

export type DebugService = typeof debug;
export const DebugService = Symbol('DebugService');
