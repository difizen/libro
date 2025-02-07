import { inject, prop, transient } from '@difizen/libro-common/mana-app';

import type { CellView } from './libro-protocol.js';
import type { LibroView } from './libro-view.js';

export interface CollapseServiceOption {
  view: LibroView;
}
export const CollapseServiceOption = Symbol('CollapseServiceOption');

export type CollapseServiceFactory = (option: CollapseServiceOption) => CollapseService;
export const CollapseServiceFactory = Symbol('CollapseServiceFactory');

export interface CellCollapsible {
  /**
   * 是否折叠子项
   */
  headingCollapsed: boolean;
  /**
   * 折叠的子项的数量
   */
  collapsibleChildNumber: number;
}

export const CellCollapsible = {
  is: (arg: Record<any, any> | undefined): arg is CellCollapsible => {
    return (
      !!arg &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'headingCollapsed' in arg &&
      typeof (arg as any).headingCollapsed === 'boolean'
    );
  },
};

export interface CollapseService {
  collapserVisible: boolean;

  view: LibroView;

  setHeadingCollapse: (cell: CellView, collapsing: boolean) => void;

  getCollapsibleChildNumber: (cell: CellView) => number;
}

export const CollapseService = Symbol('CollapseService');

@transient({ token: CollapseService })
export class DefaultCollapseService implements CollapseService {
  @prop()
  collapserVisible = false;

  view: LibroView;

  constructor(@inject(CollapseServiceOption) option: CollapseServiceOption) {
    this.view = option.view;
  }

  setHeadingCollapse(cell: CellView, collapsing: boolean) {
    if (CellCollapsible.is(cell)) {
      cell.headingCollapsed = collapsing;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCollapsibleChildNumber(cell: CellView) {
    return 0;
  }
}
