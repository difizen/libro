import * as React from 'react';
import { ViewInstance } from '../../../core/index.js';
import { useInject } from '../../../observable/index.js';
import type { TreeNodeProps } from '../tree.js';
import { TreeNode, TreeNodeComponents } from '../tree.js';
import { TREE_NODE_CONTENT_CLASS } from '../tree-protocol.js';
import type { TreeView } from '../view/tree-view.js';

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
