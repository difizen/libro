import {
  CodeCellModule,
  LibroCodeCellModel,
  LibroCodeCellView,
} from '@difizen/libro-code-cell';
import {
  CellExecutionTimeProvider,
  CellOutputBottomBlankProvider,
  LibroAddCellModule,
  LibroKeybindRegistry,
  LibroModel,
  LibroModule,
  LibroToolbarModule,
} from '@difizen/libro-core';
import { LibroKernelManageModule } from '@difizen/libro-kernel';
import { MarkdownCellModule } from '@difizen/libro-markdown-cell';
import {
  DisplayDataOutputModule,
  ErrorOutputModule,
  StreamOutputModule,
} from '@difizen/libro-output';
import { RawCellModule } from '@difizen/libro-raw-cell';
import { LibroSearchModule } from '@difizen/libro-search';
import { SearchCodeCellModule } from '@difizen/libro-search-code-cell';
import { ManaModule } from '@difizen/libro-common/app';

import { LibroBetweenCellModule } from './add-between-cell/index.js';
import { JupyterCodeCellModel, JupyterCodeCellView } from './cell/index.js';
import {
  LibroJupyterCommandContribution,
  LibroJupyterKeybindingContribution,
} from './command/index.js';
import { CellOutputBottomBlank } from './components/cell-output-bottom-blank.js';
import { CellExecutionTip } from './components/index.js';
import {
  ConfigAppContribution,
  LibroJupyterSettingContribution,
} from './config/index.js';
import { LibroJupyterContentContribution } from './contents/index.js';
import { LibroJupyterContentSaveContribution } from './contents/save-content-contribution.js';
import { LibroJupyterFileModule } from './file/index.js';
import { KeybindInstructionsModule } from './keybind-instructions/index.js';
import { LibroJupyterFileService } from './libro-jupyter-file-service.js';
import { LibroJupyterModel } from './libro-jupyter-model.js';
import { KernelStatusAndSelectorProvider } from './libro-jupyter-protocol.js';
import { JupyterServerLaunchManager } from './libro-jupyter-server-launch-manager.js';
import { LibroJupyterView } from './libro-jupyter-view.js';
import { LibroJupyterOutputArea } from './output/index.js';
import { PlotlyModule } from './rendermime/index.js';
import { LibroJupyterColorContribution } from './theme/index.js';
import {
  KernelStatusSelector,
  LibroJupyterToolbarContribution,
  SaveFileErrorContribution,
} from './toolbar/index.js';
import { WidgetModule } from './widget/index.js';

/**
 *  去除editor和lsp依赖的jupyter module，在opensumi场景使用
 */
export const LibroJupyterNoEditorModule = ManaModule.create()
  .register(
    LibroJupyterFileService,
    LibroJupyterCommandContribution,
    LibroJupyterKeybindingContribution,
    LibroJupyterToolbarContribution,
    ConfigAppContribution,
    SaveFileErrorContribution,
    LibroKeybindRegistry,
    LibroJupyterContentContribution,
    LibroJupyterContentSaveContribution,
    LibroJupyterOutputArea,
    LibroJupyterColorContribution,
    LibroJupyterSettingContribution,
    JupyterServerLaunchManager,
    LibroJupyterView,
    {
      token: CellExecutionTimeProvider,
      useValue: CellExecutionTip,
    },
    {
      token: CellOutputBottomBlankProvider,
      useValue: CellOutputBottomBlank,
    },
    {
      token: KernelStatusAndSelectorProvider,
      useValue: KernelStatusSelector,
    },
    {
      token: LibroModel,
      useClass: LibroJupyterModel,
    },
    { token: LibroCodeCellModel, useClass: JupyterCodeCellModel },
    { token: LibroCodeCellView, useClass: JupyterCodeCellView },
  )
  .dependOn(
    LibroModule,
    CodeCellModule,
    MarkdownCellModule,
    RawCellModule,
    StreamOutputModule,
    ErrorOutputModule,
    DisplayDataOutputModule,
    LibroToolbarModule,
    LibroKernelManageModule,
    LibroSearchModule,
    SearchCodeCellModule,
    LibroAddCellModule,

    // custom module
    LibroBetweenCellModule,
    KeybindInstructionsModule,
    PlotlyModule,
    LibroJupyterFileModule,
    WidgetModule,
  );
