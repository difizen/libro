import * as React from 'react';

export const MenuContext = React.createContext<MenuContext.Context>({} as any);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace MenuContext {
  export interface Context {
    prefixCls: string;
  }
}
