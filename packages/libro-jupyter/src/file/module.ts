import { FileTreeModule, ManaModule } from '@difizen/mana-app';

import { FileColorContribution } from './file-color-registry.js';
import { FileCommandContribution } from './file-command.js';
import { FileCreateModalContribution } from './file-create-modal-contribution.js';
import { FileCreateDirModalContribution } from './file-createdir-modal-contribution.js';
import { FileNameAlias } from './file-name-alias.js';
import { FileRenameModalContribution } from './file-rename-modal-contribution.js';
import { JupyterFileService } from './file-service.js';
import { FileTreeLabelProvider } from './file-tree-label-provider.js';
import { FileView } from './file-view/index.js';
import { LibroNavigatableView } from './navigatable-view.js';
import { LibroJupyterOpenHandler } from './open-handler-contribution.js';

export const LibroJupyterFileModule = ManaModule.create()
  .register(
    JupyterFileService,
    FileColorContribution,
    FileView,
    FileNameAlias,
    FileTreeLabelProvider,
    LibroNavigatableView,
    LibroJupyterOpenHandler,
    FileCommandContribution,
    FileCreateModalContribution,
    FileCreateDirModalContribution,
    FileRenameModalContribution,
  )
  .dependOn(FileTreeModule);
