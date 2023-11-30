import { LibroTOCModule } from '@difizen/libro-toc';
import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { LibroLabLayoutSlots } from '../layout/protocol.js';

import { TocPanelView } from './libro-toc-panel-view.js';

export const LibroLabTocModule = ManaModule.create()
  .register(
    TocPanelView,
    createViewPreference({
      view: TocPanelView,
      slot: LibroLabLayoutSlots.navigator,
      autoCreate: true,
      openOptions: {
        reveal: true,
        order: 'toc',
      },
    }),
  )
  .dependOn(LibroTOCModule);
