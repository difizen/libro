import {
  LibroCodeCellModel,
  LibroCodeCellView,
  CodeCellModule,
} from '@difizen/libro-codemirror-code-cell';
import { MarkdownCellModule } from '@difizen/libro-codemirror-markdown-cell';
import { RawCellModule } from '@difizen/libro-codemirror-raw-cell';
import {
  LibroModule,
  LibroToolbarModule,
  LibroKeybindRegistry,
  LibroModel,
  LibroAddCellModule,
  CellExecutionTimeProvider,
  CellInputBottonBlankProvider,
} from '@difizen/libro-core';
import { LibroKernelManageModule } from '@difizen/libro-kernel';
import {
  DisplayDataOutputModule,
  ErrorOutputModule,
  StreamOutputModule,
} from '@difizen/libro-output';
import { LibroSearchModule } from '@difizen/libro-search';
import { SearchCodemirrorCellModule } from '@difizen/libro-search-codemirror-cell';
import { ManaModule } from '@difizen/mana-app';

import { LibroBetweenCellModule } from './add-between-cell/index.js';
import { JupyterCodeCellModel, JupyterCodeCellView } from './cell/index.js';
import {
  LibroJupyterCommandContribution,
  LibroJupyterKeybindingContribution,
} from './command/index.js';
import { CellExecutionTip, CellInputBottomBlank } from './components/index.js';
import { ConfigAppContribution, LibroSettingContribution } from './config/index.js';
import { LibroConfigurationContribution } from './configuration/libro-configuration-contribution.js';
import { LibroJupyterContentContribution } from './contents/index.js';
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
  LibroJupyterToolbarContribution,
  SaveFileErrorContribution,
  KernelStatusSelector,
} from './toolbar/index.js';

export const LibroJupyterModule = ManaModule.create()
  .register(
    LibroJupyterFileService,
    LibroSettingContribution,
    LibroJupyterCommandContribution,
    LibroJupyterKeybindingContribution,
    LibroJupyterToolbarContribution,
    ConfigAppContribution,
    SaveFileErrorContribution,
    LibroKeybindRegistry,
    LibroJupyterContentContribution,
    LibroJupyterOutputArea,
    LibroJupyterColorContribution,
    JupyterServerLaunchManager,
    LibroJupyterView,
    LibroConfigurationContribution,
    {
      token: CellExecutionTimeProvider,
      useValue: CellExecutionTip,
    },
    {
      token: CellInputBottonBlankProvider,
      useValue: CellInputBottomBlank,
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
    SearchCodemirrorCellModule,
    LibroAddCellModule,
    // custom module
    LibroBetweenCellModule,
    KeybindInstructionsModule,
    PlotlyModule,
    LibroJupyterFileModule,
  );
