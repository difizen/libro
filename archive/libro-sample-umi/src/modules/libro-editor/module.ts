import { ManaModule } from '@difizen/mana-app';
import { LibroApp } from './app';
import { LibroJupyterModule } from '@difizen/libro-lab';
import { LibroEditorContentContribution } from './libro-content-contribution';

export const LibroEditorModule = ManaModule.create()
  .register(LibroApp, LibroEditorContentContribution)
  .dependOn(LibroJupyterModule);
