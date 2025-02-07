import { ViewInstance } from '@difizen/mana-core';
import { useInject } from '@difizen/mana-observable';
import * as React from 'react';

import type { TreeNode, TreeNodeProps } from '../tree';
import { TreeProps, TREE_NODE_INDENT_GUIDE_CLASS } from '../tree-protocol';
import type { TreeView } from '../view/tree-view';

type IndentGuides = 'onHover' | 'none' | 'always';
export const TreeIdent: React.FC<TreeNodeProps> = (props: TreeNodeProps) => {
  const treeViewHelper = useInject<TreeView>(ViewInstance);
  const treeProps = useInject<TreeProps>(TreeProps);
  const renderIndentGuides: IndentGuides = 'onHover' as IndentGuides; // this.corePreferences['workbench.tree.renderIndentGuides'];

  if (renderIndentGuides === 'none') {
    return null;
  }
  const { node, nodeProps } = props;
  let { depth } = nodeProps;

  const indentDivs: React.ReactNode[] = [];
  let current: TreeNode | undefined = node;
  while (current && depth) {
    const classNames: string[] = [TREE_NODE_INDENT_GUIDE_CLASS];
    if (treeViewHelper.needsActiveIndentGuideline(current)) {
      classNames.push('active');
    } else {
      classNames.push(renderIndentGuides === 'onHover' ? 'hover' : 'always');
    }
    const paddingLeft = treeProps.leftPadding * depth;
    indentDivs.unshift(
      <div
        key={depth}
        className={classNames.join(' ')}
        style={{
          paddingLeft: `${paddingLeft}px`,
        }}
      />,
    );
    current = current.parent;
    depth -= 1;
  }
  return <>{indentDivs}</>;
};
