import { useInject, ViewInstance } from '@difizen/mana-app';
import type { FC } from 'react';

import type { LibroView } from '../libro-view.js';
import { DisableOutputScroll } from '../material-from-designer.js';

export const AllOutputsScrollIcon: FC = () => {
  const libroView = useInject<LibroView>(ViewInstance);

  return (
    <div
      className={`libro-all-outputs-scroll-button ${
        libroView.outputsScroll ? 'active' : ''
      }`}
    >
      <DisableOutputScroll />
    </div>
  );
};
