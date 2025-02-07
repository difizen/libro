import { ManaModule } from '../../core/index.js';

import { DefaultTreeNodeComponents } from './components/index.js';
import { DefaultTreeProps, TreeNodeComponents } from './tree.js';
import { NoopTreeDecoratorService } from './tree-decorator.js';
import { TreeExpansionServiceImpl } from './tree-expansion.js';
import { TreeLabelProvider } from './tree-label-provider.js';
import { TreeNavigationService } from './tree-navigation.js';
import { TreeProps } from './tree-protocol.js';
import { TreeSelectionServiceImpl } from './tree-selection-impl.js';
import { TreeView } from './view/index.js';
import './style/index.less';
import './style/tree-decorator.less';

export const TreeModule = ManaModule.create().register(
  TreeView,
  TreeLabelProvider,
  TreeSelectionServiceImpl,
  TreeExpansionServiceImpl,
  TreeNavigationService,
  NoopTreeDecoratorService,
  {
    token: TreeProps,
    useValue: DefaultTreeProps,
  },
  {
    token: TreeNodeComponents,
    useValue: DefaultTreeNodeComponents,
  },
);
