import { getOrigin, useInject } from '@difizen/mana-app';
import { ViewInstance } from '@difizen/mana-app';
import type { FC } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import type { LibroView } from '../../libro-view.js';

export const DndContext: FC<any> = ({ children }) => {
  const instance = useInject<LibroView>(ViewInstance);

  if (!instance.isVisible && !instance.model.dndAreaNullEnable) {
    return null;
  }
  return (
    <DndProvider
      backend={HTML5Backend}
      options={{
        rootElement:
          instance.isVisible || !instance.model.dndAreaNullEnable
            ? getOrigin(instance).container?.current
            : null,
      }}
    >
      {children}
    </DndProvider>
  );
};
