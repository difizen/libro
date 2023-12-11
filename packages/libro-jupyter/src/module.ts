import {
  CodeCellModule,
  LibroCodeCellModel,
  LibroCodeCellView,
} from '@difizen/libro-code-cell';
import { CodeMirrorEditorModule } from '@difizen/libro-codemirror';
import { LibroE2EditorModule } from '@difizen/libro-cofine-editor';
import {
  CellExecutionTimeProvider,
  CellInputBottonBlankProvider,
  LibroAddCellModule,
  LibroKeybindRegistry,
  LibroModel,
  LibroModule,
  LibroToolbarModule,
} from '@difizen/libro-core';
import { LibroKernelManageModule } from '@difizen/libro-kernel';
import { LibroLSPModule } from '@difizen/libro-lsp';
import { MarkdownCellModule } from '@difizen/libro-markdown-cell';
import {
  DisplayDataOutputModule,
  ErrorOutputModule,
  StreamOutputModule,
} from '@difizen/libro-output';
import { RawCellModule } from '@difizen/libro-raw-cell';
import { LibroSearchModule } from '@difizen/libro-search';
import { SearchCodeCellModule } from '@difizen/libro-search-code-cell';
import { ManaModule } from '@difizen/mana-app';

import { LibroBetweenCellModule } from './add-between-cell/index.js';
import { JupyterCodeCellModel, JupyterCodeCellView } from './cell/index.js';
import {
  LibroJupyterCommandContribution,
  LibroJupyterKeybindingContribution,
} from './command/index.js';
import { CellExecutionTip, CellInputBottomBlank } from './components/index.js';
import { ConfigAppContribution, LibroSettingContribution } from './config/index.js';
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
  KernelStatusSelector,
  LibroJupyterToolbarContribution,
  SaveFileErrorContribution,
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
    SearchCodeCellModule,
    LibroAddCellModule,
    LibroLSPModule,
    LibroE2EditorModule,
    CodeMirrorEditorModule,
    // custom module
    LibroBetweenCellModule,
    KeybindInstructionsModule,
    PlotlyModule,
    LibroJupyterFileModule,
  );
