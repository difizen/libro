/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import type { LibroView } from '@difizen/libro-jupyter';
import { LibroService } from '@difizen/libro-jupyter';
import { ViewRender, useInject } from '@difizen/mana-app';
import React, { useEffect, useState } from 'react';

export const LibroKeybindDemo: React.FC = () => {
  const libroService = useInject<LibroService>(LibroService);
  const [libroView, setLibroView] = useState<LibroView | undefined>();

  useEffect(() => {
    libroService
      .getOrCreateView({
        //这里可以给每个 libro 编辑器增加标识，用于区分每次打开编辑器里面的内容都不一样
      })
      .then((libro) => {
        if (!libro) {
          return;
        }
        setLibroView(libro);
      });
  }, []);

  return (
    <div className="libro-keybind-container">
      {libroView && <ViewRender view={libroView} />}
    </div>
  );
};
