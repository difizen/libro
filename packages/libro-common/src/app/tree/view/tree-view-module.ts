import { ManaModule } from '../../../core/index.js';
import { TreeExpansionServiceImpl } from '../tree-expansion.js';
import { TreeImpl } from '../tree-impl.js';
import { TreeModelImpl } from '../tree-model.js';
import { TreeNavigationService } from '../tree-navigation.js';
import { TreeSelectionServiceImpl } from '../tree-selection-impl.js';
import { TreeViewDecorator } from './tree-view-decorator.js';

export const TreeViewModule = ManaModule.create().register(
  TreeImpl,
  TreeSelectionServiceImpl,
  TreeExpansionServiceImpl,
  TreeModelImpl,
  TreeNavigationService,
  TreeViewDecorator,
);
