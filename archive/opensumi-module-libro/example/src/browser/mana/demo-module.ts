import { ManaModule } from '@difizen/mana-app';
import { LibroOpensumiModule } from '@difizen/opensumi-module-libro';

import { LibroApp } from './libro-application';

export const DemoLibroModule = ManaModule.create()
  .register(LibroApp)
  .dependOn(LibroOpensumiModule);
