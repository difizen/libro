import { ViewRender } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { useEffect, useState } from 'react';

import type { NotebookOption, NotebookView } from '../libro-protocol.js';
import { LibroService } from '../libro-service.js';

export function LibroComponent(props: { options: NotebookOption }) {
  const libroService = useInject(LibroService);
  const [libroView, setLibroView] = useState<NotebookView | undefined>(undefined);

  useEffect(() => {
    libroService
      .getOrCreateView(props.options)
      .then((view) => {
        if (!view) {
          return;
        }
        setLibroView(view);
        return;
      })
      .catch(() => {
        //
      });
  }, [props.options, libroService]);
  if (!libroView || !libroView.view) {
    return null;
  }
  return <ViewRender view={libroView} />;
}
