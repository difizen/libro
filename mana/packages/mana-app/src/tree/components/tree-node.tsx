import * as React from 'react';
import { ViewInstance } from '@difizen/mana-core';
import { useInject } from '@difizen/mana-observable';
import type { TreeNodeProps } from '../tree';
import { TreeNode, TreeNodeComponents } from '../tree';
import { TREE_NODE_CONTENT_CLASS } from '../tree-protocol';
import type { TreeView } from '../view/tree-view';

export const TreeNodeComponent: React.FC<TreeNodeProps> = (props: TreeNodeProps) => {
  const treeNodeComponents = useInject<TreeNodeComponents>(TreeNodeComponents);
  const treeView = useInject<TreeView>(ViewInstance);
  const {
    TreeNodeIconDecorator,
    TreeNodeCaptionAffixes,
    TreeNodeExpansion,
    TreeNodeIcon,
    TreeNodeTailDecorations,
    TreeNodeCaption,
  } = treeNodeComponents;

  const { node } = props;
  if (!TreeNode.isVisible(node)) {
    return null;
  }
  const attrs = treeView.createNodeAttributes(node, props.nodeProps);
  return (
    <div {...(attrs as React.Attributes & React.HTMLAttributes<HTMLDivElement>)}>
      <div className={TREE_NODE_CONTENT_CLASS}>
        <TreeNodeExpansion {...props} />
        <TreeNodeIconDecorator {...props} icon={<TreeNodeIcon {...props} />} />
        <TreeNodeCaptionAffixes {...props} affixKey="captionPrefixes" />
        <TreeNodeCaption {...props} />
        <TreeNodeCaptionAffixes {...props} affixKey="captionSuffixes" />
        <TreeNodeTailDecorations {...props} />
      </div>
    </div>
  );
};
