import { ManaModule } from '@difizen/mana-core';

import { DefaultTreeNodeComponents } from './components';
import { DefaultTreeProps, TreeNodeComponents } from './tree';
import { NoopTreeDecoratorService } from './tree-decorator';
import { TreeExpansionServiceImpl } from './tree-expansion';
import { TreeLabelProvider } from './tree-label-provider';
import { TreeNavigationService } from './tree-navigation';
import { TreeProps } from './tree-protocol';
import { TreeSelectionServiceImpl } from './tree-selection-impl';
import { TreeView } from './view';
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
