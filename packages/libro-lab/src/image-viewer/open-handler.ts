import { LibroJupyterConfiguration } from '@difizen/libro-jupyter';
import type { URI, ViewOpenHandlerOptions } from '@difizen/libro-common/app';
import { ConfigurationService, inject } from '@difizen/libro-common/app';
import {
  NavigatableViewOpenHandler,
  OpenHandler,
  singleton,
  Priority,
} from '@difizen/libro-common/app';

import { imageExtToTypes } from './protocol.js';
import { NavigatableImageViewerViewFactoryId } from './viewer.js';
import type { NavigatableImageViewerView } from './viewer.js';

@singleton({ contrib: OpenHandler })
export class ImageViewerOpenHandler extends NavigatableViewOpenHandler<NavigatableImageViewerView> {
  @inject(ConfigurationService) protected configurationService: ConfigurationService;

  id = NavigatableImageViewerViewFactoryId;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandle(uri: URI, _options?: ViewOpenHandlerOptions) {
    if (uri.scheme === 'file') {
      const ext = uri.path.ext;
      if (imageExtToTypes.has(ext.toLowerCase())) {
        return 100;
      }
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
