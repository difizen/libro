export const ToolbarArgs = Symbol('ToolbarArgs');

export type ToolbarItemData = any | any[];

export interface ToolbarItemState {
  id: string;
  enable: boolean;
  visible: boolean;
  active: boolean;
}
