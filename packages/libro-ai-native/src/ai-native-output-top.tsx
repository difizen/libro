import type { CellOutputTopProvider } from '@difizen/libro-jupyter';
import { forwardRef } from 'react';

export const LibroAINativeCellTopBlank: CellOutputTopProvider = forwardRef(
  function LibroAINativeTopBlank() {
    return <div>LibroAINativeTopBlank</div>;
  },
);
