import type { CellModel } from '../libro-protocol.js';

export interface LibroMarkdownCellModel extends CellModel {
  isEdit: boolean;

  preview: string;
}

export const LibroMarkdownCellModel = {
  is: (arg: Record<any, any> | undefined): arg is LibroMarkdownCellModel => {
    return (
      !!arg &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'isEdit' in arg &&
      typeof (arg as any).isEdit === 'boolean' &&
      'preview' in arg &&
      typeof (arg as any).preview === 'string'
    );
  },
};
