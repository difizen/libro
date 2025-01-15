/* eslint-disable @typescript-eslint/no-explicit-any */
import { Syringe } from '@difizen/mana-syringe';

import type { ManaModule } from '../module';

export type DataContextContriburtionKey = string | symbol;
export const DataContextContriburtion = Syringe.defineToken('DataContextContriburtion');
export interface DataContextContriburtion<T = any> {
  key: DataContextContriburtionKey;
  module: ManaModule;
  onCreate?: (ctx: Syringe.Context, options?: T) => void;
  getKey?: (ctx: Syringe.Context, options?: T) => any;
}

export const createDataContextContriburtion = (
  contribution: DataContextContriburtion,
) => {
  return { token: DataContextContriburtion, useValue: contribution };
};

export const DataContextSymbol = Symbol('DataContextSymbol');
