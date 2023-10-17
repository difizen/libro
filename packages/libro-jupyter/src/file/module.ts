import { FileTreeModule, ManaModule } from '@difizen/mana-app';

import { FileNameAlias } from './file-name-alias.js';
import { JupyterFileService } from './file-service.js';
import { FileTreeLabelProvider } from './file-tree-label-provider.js';
import { FileView } from './file-view/index.js';
import { LibroNavigatableView } from './navigatable-view.js';
import { LibroJupyterOpenHandler } from './open-handler-contribution.js';

export const LibroJupyterFileModule = ManaModule.create()
  .register(
    JupyterFileService,
    FileView,
    FileNameAlias,
    FileTreeLabelProvider,
    LibroNavigatableView,
    LibroJupyterOpenHandler,
  )
  .dependOn(FileTreeModule);
