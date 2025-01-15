import { FileService, FileTreeModule, RootSlotId } from '@difizen/mana-app';
import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { FileApplication } from './file-application';
import { FileCommandContribution } from './file-command';
import { FileView } from './file-view/index';
import { MockFileService } from './mock-file-service';

export const FileModule = ManaModule.create()
  .register(
    FileView,
    FileApplication,
    FileCommandContribution,
    {
      token: FileService,
      useClass: MockFileService,
    },
    createViewPreference({
      view: FileView,
      autoCreate: true,
      slot: RootSlotId,
    }),
  )
  .dependOn(FileTreeModule);
