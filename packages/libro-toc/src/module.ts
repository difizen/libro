import { MarkdownModule } from '@difizen/libro-markdown';
import { LibroRenderMimeModule } from '@difizen/libro-rendermime';
import { ManaModule } from '@difizen/libro-common/mana-app';

import { LibroCellTOCProvider } from './cell-toc-provider.js';
import { LibroTocColorRegistry } from './libro-toc-color-registry.js';
import { MarkDownCellTOCProvider } from './provider/markdown-toc-provider.js';
import { OutputTOCProvider } from './provider/output-toc-provider.js';
import { TOCCollapseService } from './toc-collapse-service.js';
import { TOCSettingContribution } from './toc-configuration.js';
import { LibroTocSlotContribution } from './toc-contribution.js';
import { LibroTOCManager } from './toc-manager.js';
import { CellTOCProviderContribution, TOCProviderOption } from './toc-protocol.js';
import { LibroTOCProvider, LibroTOCProviderFactory } from './toc-provider.js';
import { TOCView } from './toc-view.js';

/**
 * 不带output支持
 */
export const LibroBaseTOCModule = ManaModule.create()
  .contribution(CellTOCProviderContribution)
  .register(
    TOCSettingContribution,
    TOCView,
    LibroTOCProvider,
    {
      token: LibroTOCProviderFactory,
      useFactory: (ctx) => {
        return (option) => {
          const child = ctx.container.createChild();
          child.register({
            token: TOCProviderOption,
            useValue: option,
          });
          return child.get(LibroTOCProvider);
        };
      },
    },
    LibroTOCManager,
    LibroCellTOCProvider,
    MarkDownCellTOCProvider,
    TOCCollapseService,
    LibroTocColorRegistry,
  )
  .dependOn(MarkdownModule);
/**
 * 标准的notebook TOC
 */
export const LibroTOCModule = ManaModule.create()
  .register(OutputTOCProvider)
  .dependOn(LibroBaseTOCModule, LibroRenderMimeModule);

/**
 * toc在内容区右侧
 */
export const LibroTOCOnContentModule = ManaModule.create().register(
  LibroTocSlotContribution,
);
