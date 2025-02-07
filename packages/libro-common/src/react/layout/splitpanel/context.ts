import * as React from 'react';

export interface ResizeHandle {
  setSize: (targetSize?: number, isLatter?: boolean) => void;
  setRelativeSize: (prev: number, next: number, isLatter: boolean) => void;
  getSize: (isLatter: boolean) => number;
  getRelativeSize: (isLatter: boolean) => number[];
  lockSize: (lock: boolean | undefined, isLatter: boolean) => void;
  setMaxSize: (lock: boolean | undefined, isLatter: boolean) => void;
  hidePanel: (show?: boolean) => void;
}

export interface SplitPanelContextProps extends ResizeHandle {
  prefixCls?: string;
}

export const SplitPanelContext = React.createContext<SplitPanelContextProps>({
  setSize: () => {
    //
  },
  setRelativeSize: () => {
    //
  },
  getSize: () => 0,
  getRelativeSize: () => [0, 0],
  lockSize: () => {
    //
  },
  setMaxSize: () => {
    //
  },
  hidePanel: () => {
    //
  },
});
