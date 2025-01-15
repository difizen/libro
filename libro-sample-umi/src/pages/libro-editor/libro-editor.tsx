/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import type { LibroView } from '@difizen/libro-jupyter';
import { DocumentCommands, LibroService } from '@difizen/libro-jupyter';
import { CommandRegistry, ViewRender, useInject } from '@difizen/mana-app';
import React from 'react';
import { useEffect, useState } from 'react';

export const LibroEditor: React.FC = () => {
  const libroService = useInject<LibroService>(LibroService);
  const [libroView, setLibroView] = useState<LibroView | undefined>();
  const [handle, setHandle] = useState<number | undefined>();
  const commandRegistry = useInject(CommandRegistry);

  const save = () => {
    //通过命令进行保存
    commandRegistry.executeCommand(
      DocumentCommands['Save'].id,
      undefined,
      libroView,
      undefined,
      { reason: 'autoSave' },
    );
  };

  const doAutoSave = () => {
    //设置自动保存逻辑
    const handle = window.setTimeout(() => {
      save();
      if (libroView) {
        libroView.model.dirty = false;
      }
    }, 1000);
    setHandle(handle);
  };

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
        libro.model.onChanged(() => {
          doAutoSave();
        });
      });

    return () => {
      window.clearTimeout(handle);
    };
  }, [doAutoSave, handle, libroService]);

  return (
    <div className="libro-editor-container">
      {libroView && <ViewRender view={libroView} />}
    </div>
  );
};
