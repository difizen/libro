import type { URI, ViewOpenHandlerOptions } from '@difizen/mana-app';
import { ConfigurationService, inject } from '@difizen/mana-app';
import {
  NavigatableViewOpenHandler,
  OpenHandler,
  singleton,
  Priority,
} from '@difizen/mana-app';

import { LibroJupyterConfiguration } from '../configuration/index.js';

import type { LibroNavigatableView } from './navigatable-view.js';
import { LibroNavigatableViewFactoryId } from './navigatable-view.js';

@singleton({ contrib: OpenHandler })
export class LibroJupyterOpenHandler extends NavigatableViewOpenHandler<LibroNavigatableView> {
  @inject(ConfigurationService) protected configurationService: ConfigurationService;

  id = LibroNavigatableViewFactoryId;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandle(uri: URI, _options?: ViewOpenHandlerOptions) {
    if (uri.scheme === 'file' && uri.path.ext === '.ipynb') {
      return Priority.PRIOR + 1;
    }
    return Priority.IDLE;
  }

  override async open(uri: URI, options: ViewOpenHandlerOptions = {}) {
    const { viewOptions, ...extra } = options;
    const slot = await this.configurationService.get(
      LibroJupyterConfiguration['OpenSlot'],
    );
    return super.open(uri, {
      slot,
      viewOptions: {
        path: uri.path.toString(),
        ...viewOptions,
      },
      reveal: true,
      ...extra,
    });
  }
}
