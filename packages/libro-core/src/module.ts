import { CodeEditorModule } from '@difizen/libro-code-editor';
import { ConfigurationModule, ManaAppPreset } from '@difizen/libro-common/app';
import { ManaModule } from '@difizen/libro-common/app';

import { LibroCellModule } from './cell/libro-cell-module.js';
import {
  CollapseService,
  CollapseServiceFactory,
  CollapseServiceOption,
  DefaultCollapseService,
} from './collapse-service.js';
import { LibroCommandModule } from './command/index.js';
import {
  BetweenCellProvider,
  CellExecutionTimeProvider,
  CellInputBottonBlankProvider,
  CellOutputBottomBlankProvider,
  CellOutputTopProvider,
  CellOutputVisulizationProvider,
  LibroBetweenCellContent,
  LibroCellExecutionTime,
  LibroCellInputBottonBlank,
  LibroCellOutputBottomBlank,
  LibroCellTopBlank,
  LibroCellVisualization,
} from './components/index.js';
import { LibroContentModule } from './content/index.js';
import { LibroFormatterModule } from './formatter/index.js';
import { LibroContextKey } from './libro-context-key.js';
import { LibroModel } from './libro-model.js';
import {
  ModelFactory,
  NotebookOption,
  VirtualizedManagerOption,
  VirtualizedManagerOptionFactory,
} from './libro-protocol.js';
import { LibroService } from './libro-service.js';
import { LibroSettingContribution } from './libro-setting-contribution.js';
import { LibroViewTracker } from './libro-view-tracker.js';
import { LibroView } from './libro-view.js';
import { BaseWorkspaceService } from './libro-workspace-service.js';
import { OutputModule } from './output/index.js';
import { LibroSlotModule } from './slot/index.js';
import { LibroColorRegistry } from './theme/libro-color-registry.js';
import { VirtualizedManagerHelper } from './virtualized-manager-helper.js';
import { VirtualizedManager } from './virtualized-manager.js';

export const LibroModule = ManaModule.create()
  .register(
    BaseWorkspaceService,
    VirtualizedManager,
    LibroService,
    LibroContextKey,
    LibroModel,
    LibroView,
    LibroSettingContribution,
    LibroColorRegistry,
    LibroViewTracker,
    {
      token: ModelFactory,
      useFactory: (ctx) => {
        return (options: NotebookOption) => {
          const child = ctx.container.createChild();
          child.register({ token: NotebookOption, useValue: options });
          return child.get(LibroModel);
        };
      },
    },
    DefaultCollapseService,
    {
      token: CollapseServiceFactory,
      useFactory: (ctx) => {
        return (options: CollapseServiceOption) => {
          const child = ctx.container.createChild();
          child.register({ token: CollapseServiceOption, useValue: options });
          return child.get(CollapseService);
        };
      },
    },
    VirtualizedManagerHelper,
    VirtualizedManager,
    {
      token: VirtualizedManagerOptionFactory,
      useFactory: (ctx) => {
        return (target: VirtualizedManagerOptionFactory) => {
          const child = ctx.container.createChild();
          child.register({ token: VirtualizedManagerOption, useValue: target });
          return child.get(VirtualizedManager);
        };
      },
    },
    {
      token: CellExecutionTimeProvider,
      useValue: LibroCellExecutionTime,
    },
    {
      token: CellInputBottonBlankProvider,
      useValue: LibroCellInputBottonBlank,
    },
    {
      token: CellOutputBottomBlankProvider,
      useValue: LibroCellOutputBottomBlank,
    },
    {
      token: CellOutputTopProvider,
      useValue: LibroCellTopBlank,
    },
    {
      token: CellOutputVisulizationProvider,
      useValue: LibroCellVisualization,
    },
    {
      token: BetweenCellProvider,
      useValue: LibroBetweenCellContent,
    },
  )
  .dependOn(
    ManaAppPreset,
    LibroCellModule,
    LibroSlotModule,
    CodeEditorModule,
    LibroCommandModule,
    ConfigurationModule,
    OutputModule,
    LibroContentModule,
    LibroFormatterModule,
  );
