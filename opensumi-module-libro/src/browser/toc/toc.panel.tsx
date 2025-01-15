/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/no-shadow */
import { TOCView } from '@difizen/libro-toc';
import type { Container } from '@difizen/mana-app';
import { ViewManager, ViewRender } from '@difizen/mana-app';
import type { URI, ViewState } from '@opensumi/ide-core-browser';
import { useInjectable } from '@opensumi/ide-core-browser';
import { WorkbenchEditorService } from '@opensumi/ide-editor';
import type { WorkbenchEditorServiceImpl } from '@opensumi/ide-editor/lib/browser/workbench-editor.service';
import { OutlinePanel } from '@opensumi/ide-outline/lib/browser/outline';
import type { PropsWithChildren } from 'react';
import React, { useEffect, useState } from 'react';

import { ManaContainer } from '../../common';
import { LIBRO_COMPONENTS_SCHEME_ID } from '../libro.protocol';
import { ILibroOpensumiService } from '../libro.service';

import styles from './toc.module.less';

export const TocPanel = ({
  viewState,
}: PropsWithChildren<{ viewState: ViewState }>) => {
  const editorService = useInjectable<WorkbenchEditorServiceImpl>(
    WorkbenchEditorService,
  );
  const libroOpensumiService = useInjectable<ILibroOpensumiService>(
    ILibroOpensumiService,
  );
  const manaContainer = useInjectable<Container>(ManaContainer);

  const [libroTocView, setLibroTocView] = useState<TOCView | undefined>();

  useEffect(() => {
    if (
      editorService.currentResource?.uri.path.ext ===
      `.${LIBRO_COMPONENTS_SCHEME_ID}`
    ) {
      libroOpensumiService
        .getOrCreatLibroView(editorService.currentResource.uri)
        .then((libro) => {
          const viewManager = manaContainer.get(ViewManager);
          viewManager
            .getOrCreateView<TOCView>(TOCView, {
              id: (editorService.currentResource?.uri as URI).toString(),
            })
            .then((libroTocView) => {
              libroTocView.parent = libro;
              setLibroTocView(libroTocView);
              return;
            });
        });
    }
    editorService.onActiveResourceChange((e) => {
      if (e?.uri.path.ext === `.${LIBRO_COMPONENTS_SCHEME_ID}`) {
        libroOpensumiService.getOrCreatLibroView(e.uri).then((libro) => {
          const viewManager = manaContainer.get(ViewManager);
          viewManager
            .getOrCreateView<TOCView>(TOCView, {
              id: (e.uri as URI).toString(),
            })
            .then((libroTocView) => {
              libroTocView.parent = libro;
              setLibroTocView(libroTocView);
              return;
            });
        });
      } else {
        setLibroTocView(undefined);
      }
    });
  });
  if (libroTocView) {
    return (
      <div className={styles.toc}>
        <ViewRender view={libroTocView}></ViewRender>
      </div>
    );
  } else {
    return <OutlinePanel viewState={viewState}></OutlinePanel>;
  }
};
