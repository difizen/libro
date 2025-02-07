import { ManaModule } from '@difizen/mana-app';
import { LibroApp } from './app';
import { LibroLabModule } from '@difizen/libro-lab';

export const LabModule = ManaModule.create()
  .register(LibroApp)
  .dependOn(LibroLabModule);
