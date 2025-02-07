import { ManaModule } from '../../core/index.js';

import {
  DefaultTreeNodeComponents,
  TreeModule,
  TreeNodeComponents,
} from '../tree/index.js';

import { FileService } from './file-service.js';
import { TreeNodeIcon } from './file-tree-icon.js';
import { FileTreeLabelProvider } from './file-tree-label-provider.js';
import { FileTreeView } from './file-tree-view.js';

export const FileTreeModule = ManaModule.create()
  .register(FileTreeView)
  .register(FileService, FileTreeLabelProvider)
  .register({
    token: TreeNodeComponents,
    useValue: { ...DefaultTreeNodeComponents, TreeNodeIcon },
  })
  .dependOn(TreeModule);
