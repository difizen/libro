import { LibroModule, OutputModule } from '@difizen/libro-jupyter';
import { LibroRenderMimeModule } from '@difizen/libro-rendermime';
import { ManaModule } from '@difizen/mana-app';

export const LibroSqlCellModule = ManaModule.create().dependOn(
  LibroModule,
  OutputModule,
  LibroRenderMimeModule,
);
