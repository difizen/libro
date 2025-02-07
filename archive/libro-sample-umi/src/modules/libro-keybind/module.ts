import { ManaModule } from '@difizen/mana-app';
import { LibroEditorModule } from '../libro-editor/module';
import { LibroDemoKeybindingContribution } from './libro-demo-keybind-contribution';

export const LibroKeybindDemoModule = ManaModule.create()
  .register(LibroDemoKeybindingContribution)
  .dependOn(LibroEditorModule);
