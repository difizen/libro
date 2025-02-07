import { ViewInstance } from '@difizen/mana-core';
import { useInject } from '@difizen/mana-observable';

import {
  BUSY_CLASS,
  COLLAPSED_CLASS,
  EXPANSION_TOGGLE_CLASS,
} from '../../style/style-protocol';
import { TreeNodeComponents } from '../tree';
import type { TreeNodeProps } from '../tree';
import { ExpandableTreeNode } from '../tree-expansion';
import { TREE_NODE_SEGMENT_CLASS } from '../tree-protocol';
import type { TreeView } from '../view/tree-view';

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
