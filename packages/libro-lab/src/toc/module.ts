import { LibroTOCModule } from '@difizen/libro-toc';
import { ManaModule } from '@difizen/libro-common/app';

import { TocPanelView } from './libro-toc-panel-view.js';

export const LibroLabTocModule = ManaModule.create()
  .register(TocPanelView)
  .dependOn(LibroTOCModule);
