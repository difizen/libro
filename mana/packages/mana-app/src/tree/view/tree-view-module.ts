import { ManaModule } from '@difizen/mana-core';
import { TreeExpansionServiceImpl } from '../tree-expansion';
import { TreeImpl } from '../tree-impl';
import { TreeModelImpl } from '../tree-model';
import { TreeNavigationService } from '../tree-navigation';
import { TreeSelectionServiceImpl } from '../tree-selection-impl';
import { TreeViewDecorator } from './tree-view-decorator';

export const TreeViewModule = ManaModule.create().register(
  TreeImpl,
  TreeSelectionServiceImpl,
  TreeExpansionServiceImpl,
  TreeModelImpl,
  TreeNavigationService,
  TreeViewDecorator,
);
