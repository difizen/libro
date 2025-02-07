import { ManaModule } from '@difizen/mana-app';
import { LibroEditorModule } from '../libro-editor/module';
import { LibroDemoToolbarContribution } from './libro-demo-toolbar-contribution';

export const LibroToolbarDemoModule = ManaModule.create()
  .register(LibroDemoToolbarContribution)
  .dependOn(LibroEditorModule);
