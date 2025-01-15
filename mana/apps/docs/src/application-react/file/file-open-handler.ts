/* eslint-disable @typescript-eslint/no-unused-vars */
import type { URI } from '@difizen/mana-app';
import type { ViewOpenHandlerOptions } from '@difizen/mana-app';
import { Priority } from '@difizen/mana-app';
import { OpenHandler } from '@difizen/mana-app';
import { NavigatableViewOpenHandler } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

import type { ContentView } from '../content/index.js';
import { WorkbenchLayoutArea } from '../workbench/layout/workbench-layout.js';

@singleton({ contrib: OpenHandler })
export class FileOpenHandler extends NavigatableViewOpenHandler<ContentView> {
  id = 'content-view';

  canHandle(uri: URI, options?: ViewOpenHandlerOptions) {
    if (uri.scheme === 'file') {
      return Priority.PRIOR;
    }
    return Priority.IDLE;
  }

  override async open(uri: URI, options?: ViewOpenHandlerOptions) {
    return super.open(uri, {
      slot: WorkbenchLayoutArea.main,
      viewOptions: {
        path: uri.path.toString(),
      },
      reveal: true,
      ...options,
    });
  }
}
