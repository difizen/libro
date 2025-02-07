import type { TreeNodeComponents } from '../tree';
import { TreeNodeCaption } from './tree-node-caption';
import { TreeNodeExpansion } from './tree-node-expansion';
import { TreeNodeIcon } from './tree-node-icon';
import { TreeNodeIconDecorator } from './tree-node-icon-decorator';
import { TreeNodeCaptionAffixes } from './tree-node-caption-affix';
import { TreeNodeTailDecorations } from './tree-node-tail-decoration';
import { TreeNodeComponent } from './tree-node';
import { TreeIdent } from './tree-ident';
import { TreeSwitchIcon } from './tree-switch-icon';

export const DefaultTreeNodeComponents: TreeNodeComponents = {
  TreeNodeExpansion,
  TreeNode: TreeNodeComponent,
  TreeNodeIcon,
  TreeNodeCaption,
  TreeNodeCaptionAffixes,
  TreeNodeTailDecorations,
  TreeNodeIconDecorator,
  TreeIdent,
  TreeSwitchIcon,
};
