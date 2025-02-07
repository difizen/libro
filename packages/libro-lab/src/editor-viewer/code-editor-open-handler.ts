import { LibroJupyterConfiguration } from '@difizen/libro-jupyter';
import type { URI, ViewOpenHandlerOptions } from '@difizen/libro-common/app';
import { ConfigurationService, inject } from '@difizen/libro-common/app';
import { Priority } from '@difizen/libro-common/app';
import {
  NavigatableViewOpenHandler,
  OpenHandler,
  singleton,
} from '@difizen/libro-common/app';

import type { CodeEditorViewer } from './code-editor-viewer.js';
import { CodeEditorViewerFactory, textFileTypes } from './protocol.js';

@singleton({ contrib: OpenHandler })
export class CodeEditorViewerOpenHandler extends NavigatableViewOpenHandler<CodeEditorViewer> {
  @inject(ConfigurationService) protected configurationService: ConfigurationService;

  id = CodeEditorViewerFactory;

  // TODO: 支持打开的文件扩展
  canHandle(uri: URI, options?: ViewOpenHandlerOptions) {
    if (uri.scheme === 'file' && textFileTypes.includes(uri.path.ext.toLowerCase())) {
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
