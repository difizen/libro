import { LibroJupyterConfiguration } from '@difizen/libro-jupyter';
import type { URI, ViewOpenHandlerOptions } from '@difizen/mana-app';
import { ConfigurationService, inject } from '@difizen/mana-app';
import { Priority } from '@difizen/mana-app';
import { NavigatableViewOpenHandler, OpenHandler, singleton } from '@difizen/mana-app';

import type { CodeEditorViewer } from './code-editor-viewer.js';
import { CodeEditorViewerFactory } from './protocol.js';

@singleton({ contrib: OpenHandler })
export class CodeEditorViewerOpenHandler extends NavigatableViewOpenHandler<CodeEditorViewer> {
  @inject(ConfigurationService) protected configurationService: ConfigurationService;

  id = CodeEditorViewerFactory;

  canHandle(uri: URI, options?: ViewOpenHandlerOptions) {
    if (
      uri.scheme === 'file' &&
      !['.tar', '.zip', '.7z', '.gz', 'rar'].includes(uri.path.ext)
    ) {
      return 100;
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
