import { ManaModule } from '../../mana-core/index.js';

import { DefaultTreeNodeComponents, TreeModule, TreeNodeComponents } from '../tree';

import { FileService } from './file-service';
import { TreeNodeIcon } from './file-tree-icon';
import { FileTreeLabelProvider } from './file-tree-label-provider';
import { FileTreeView } from './file-tree-view';

export const FileTreeModule = ManaModule.create()
  .register(FileTreeView)
  .register(FileService, FileTreeLabelProvider)
  .register({
    token: TreeNodeComponents,
    useValue: { ...DefaultTreeNodeComponents, TreeNodeIcon },
  })
  .dependOn(TreeModule);
