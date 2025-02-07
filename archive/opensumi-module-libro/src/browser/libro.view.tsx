/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */

import type { LibroView } from '@difizen/libro-jupyter';
import { DocumentCommands } from '@difizen/libro-jupyter';
import type { Container } from '@difizen/mana-app';
import { CommandRegistry, ViewRender } from '@difizen/mana-app';
import type { Injector } from '@opensumi/di';
import { INJECTOR_TOKEN } from '@opensumi/di';
import type { URI } from '@opensumi/ide-core-browser';
import { useInjectable } from '@opensumi/ide-core-browser';
import type { ReactEditorComponent } from '@opensumi/ide-editor/lib/browser/types';
import * as React from 'react';

import { ManaContainer } from '../common';

import styles from './libro.module.less';
import { ILibroOpensumiService } from './libro.service';
import { LibroTracker } from './libro.view.tracker';

export const OpensumiLibroView: ReactEditorComponent = (...params) => {
  const libroOpensumiService = useInjectable<ILibroOpensumiService>(
    ILibroOpensumiService,
  );
  const manaContainer = useInjectable<Container>(ManaContainer);
  const commandRegistry = manaContainer.get(CommandRegistry);
  const injector: Injector = useInjectable(INJECTOR_TOKEN);

  const [libroTracker, setLibroTracker] = React.useState<LibroTracker>();

  const [libroView, setLibroView] = React.useState<LibroView | undefined>(
    undefined,
  );

  React.useEffect(() => {
    if (libroTracker?.refreshTimer) {
      libroView?.dispose();
    }
    let autoSaveHandle: undefined | number = undefined;
    libroOpensumiService
      .getOrCreatLibroView(params[0].resource.uri)
      .then((libro) => {
        setLibroView(libro);
        if (
          !libroOpensumiService.libroTrackerMap.has(
            (params[0].resource.uri as URI).toString(),
          )
        ) {
          const tracker = injector.get(LibroTracker);
          setLibroTracker(tracker);
          libroOpensumiService.libroTrackerMap.set(
            (params[0].resource.uri as URI).toString(),
            tracker,
          );
        }
        libro.model.onChanged(() => {
          libroOpensumiService.updateDirtyStatus(params[0].resource.uri, true);
          if (autoSaveHandle) {
            window.clearTimeout(autoSaveHandle);
          }
          autoSaveHandle = window.setTimeout(() => {
            commandRegistry
              .executeCommand(
                DocumentCommands.Save.id,
                undefined,
                libro,
                undefined,
                { reason: 'autoSave' },
              )
              .then(() => {
                if (libro) {
                  libro.model.dirty = false;
                }
              });
          }, 1000);
        });
        libro.onSave(() => {
          libroOpensumiService.updateDirtyStatus(params[0].resource.uri, false);
        });
      });
    return () => {
      window.clearTimeout(autoSaveHandle);
    };
  }, [
    commandRegistry,
    injector,
    libroOpensumiService,
    libroTracker?.refreshTimer,
    libroView,
    params,
  ]);

  return (
    <div className={styles.libroView}>
      {libroView && <ViewRender view={libroView}></ViewRender>}
    </div>
  );
};
