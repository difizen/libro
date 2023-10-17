import type { IEditor, IRange } from '@difizen/libro-code-editor';
import { prop } from '@difizen/mana-app';

import type { CellView } from '../libro-protocol.js';
import { isCellView } from '../libro-protocol.js';

import { LibroCellView } from './libro-cell-view.js';

export interface EditorCellView extends CellView {
  editor: IEditor | undefined;

  redo: () => void;

  undo: () => void;
  getSelections: () => IRange[];
  getSelectionsOffsetAt: (selection: IRange) => {
    start: number;
    end: number;
  };
}

export const EditorCellView = {
  is: (arg: Record<any, any> | undefined): arg is EditorCellView => {
    return (
      !!arg &&
      isCellView(arg as any) &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'redo' in arg &&
      typeof (arg as any).redo === 'function' &&
      'undo' in arg &&
      typeof (arg as any).undo === 'function'
    );
  },
};

/**
 * 带有编辑器能力的cell view，例如raw、markdown、python、sql等
 * 超出编辑器的相关能力放在其他的更高抽象中
 */
export abstract class LibroEditorCellView
  extends LibroCellView
  implements EditorCellView
{
  @prop()
  editor: IEditor | undefined;

  abstract getSelections: () => IRange[];
  abstract getSelectionsOffsetAt: (selection: IRange) => { start: number; end: number };
  get wrapperCls() {
    return '';
  }

  redo(): void {
    this.editor?.redo();
  }

  undo(): void {
    this.editor?.undo();
  }
}
