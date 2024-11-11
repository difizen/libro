import { LibroJupyterConfiguration } from '@difizen/libro-jupyter';
import type { URI, ViewOpenHandlerOptions } from '@difizen/mana-app';
import { ConfigurationService, inject } from '@difizen/mana-app';
import { NavigatableViewOpenHandler, OpenHandler, singleton } from '@difizen/mana-app';

import type { LibroDefaultViewer } from './libro-default-viewer.js';
import { LibroDefaultViewerFactory } from './protocol.js';

@singleton({ contrib: OpenHandler })
export class LibroDefaultViewerOpenHandler extends NavigatableViewOpenHandler<LibroDefaultViewer> {
  @inject(ConfigurationService) protected configurationService: ConfigurationService;

  id = LibroDefaultViewerFactory;

  canHandle() {
    return 100;
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
