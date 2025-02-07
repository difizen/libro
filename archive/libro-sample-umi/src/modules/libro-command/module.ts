import { ManaModule } from '@difizen/mana-app';
import { LibroEditorModule } from '../libro-editor/module';
import { LibroCommandDemoService } from './libro-command-demo-service';
import { LibroDemoCommandContribution } from './libro-demo-command-contribution';

export const LibroCommandDemoModule = ManaModule.create()
  .register(LibroCommandDemoService, LibroDemoCommandContribution)
  .dependOn(LibroEditorModule);
