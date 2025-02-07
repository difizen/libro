import * as React from 'react';

export const MenubarContext = React.createContext<MenubarContext.Contexts>({} as any);

export namespace MenubarContext {
  export interface Contexts {
    prefixCls: string;
    activeMenubar: () => void;
    menubarActived: boolean;
    inContent: (element: HTMLElement) => boolean;
    activeItem?: string | undefined;
    activeElementRef?: React.MutableRefObject<HTMLDivElement | null> | undefined;
    setActiveElementRef: (
      element?: React.MutableRefObject<HTMLDivElement | null>,
    ) => void;
  }
}
