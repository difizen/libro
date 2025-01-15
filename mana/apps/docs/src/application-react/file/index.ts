import { createViewPreference, ManaModule } from '@difizen/mana-app';
import { FileTreeModule } from '@difizen/mana-app';

import { WorkbenchLayoutArea } from '../workbench/layout/workbench-layout.js';

import { FileApplication } from './file-application.js';
import { FileOpenHandler } from './file-open-handler.js';
import { FileView } from './file-view/index.js';

export const FileModule = ManaModule.create()
  .register(
    FileView,
    FileApplication,
    FileOpenHandler,
    createViewPreference({
      view: FileView,
      autoCreate: true,
      slot: WorkbenchLayoutArea.left,
    }),
  )
  .dependOn(FileTreeModule);
