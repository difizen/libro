import { ViewInstance } from '../../../core/index.js';
import { useInject } from '../../../observable/index.js';

import {
  BUSY_CLASS,
  COLLAPSED_CLASS,
  EXPANSION_TOGGLE_CLASS,
} from '../../style/style-protocol.js';
import { TreeNodeComponents } from '../tree.js';
import type { TreeNodeProps } from '../tree.js';
import { ExpandableTreeNode } from '../tree-expansion.js';
import { TREE_NODE_SEGMENT_CLASS } from '../tree-protocol.js';
import type { TreeView } from '../view/tree-view.js';

export function TreeNodeExpansion(props: TreeNodeProps) {
  const treeNodeComponents = useInject<TreeNodeComponents>(TreeNodeComponents);
  const { TreeSwitchIcon } = treeNodeComponents;
  const treeView = useInject<TreeView>(ViewInstance);
  const { node } = props;
  if (!ExpandableTreeNode.is(node)) {
    return null;
  }
  const classes = [TREE_NODE_SEGMENT_CLASS, EXPANSION_TOGGLE_CLASS];
  if (!node.expanded) {
    classes.push(COLLAPSED_CLASS);
  }
  if (node.busy) {
    classes.push(BUSY_CLASS);
  }
  const className = classes.join(' ');
  return (
    <div data-node-id={node.id} className={className} onClick={treeView.toggle}>
      <TreeSwitchIcon {...props} />
    </div>
  );
}
