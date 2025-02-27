import { ViewInstance } from '../../../core/index.js';
import { useInject } from '../../../observable/index.js';
import * as React from 'react';

import { notEmpty } from '../../../common/index.js';
import type { TreeNodeCaptionAffixesProps } from '../tree.js';
import {
  TREE_NODE_SEGMENT_CLASS,
  TREE_NODE_SEGMENT_GROW_CLASS,
} from '../tree-protocol.js';
import { TreeViewDecorationStyles } from '../tree-view-decoration.js';
import type { TreeView } from '../view/tree-view.js';
import { TreeViewDecorator } from '../view/tree-view-decorator.js';

export const TreeNodeCaptionAffixes: React.FC<TreeNodeCaptionAffixesProps> = (
  props: TreeNodeCaptionAffixesProps,
) => {
  const treeViewDecorator = useInject<TreeViewDecorator>(TreeViewDecorator);
  const treeView = useInject<TreeView>(ViewInstance);

  const { affixKey, node } = props;
  const suffix = affixKey === 'captionSuffixes';
  const affixClass = suffix
    ? TreeViewDecorationStyles.CAPTION_SUFFIX_CLASS
    : TreeViewDecorationStyles.CAPTION_PREFIX_CLASS;
  const classes = [TREE_NODE_SEGMENT_CLASS, affixClass];
  const affixes = treeViewDecorator
    .getDecorationData(node, affixKey)
    .filter(notEmpty)
    .reduce((acc, current) => acc.concat(current), []);
  const children: React.ReactNode[] = [];
  for (let i = 0; i < affixes.length; i += 1) {
    const affix = affixes[i];
    if (suffix && i === affixes.length - 1) {
      classes.push(TREE_NODE_SEGMENT_GROW_CLASS);
    }
    const style = treeView.applyFontStyles({}, affix.fontData);
    const className = classes.join(' ');
    const key = `${node.id}_${i}`;
    children.push(
      <div key={key} className={className} style={style}>
        {affix.data}
      </div>,
    );
  }
  return <>{children}</>;
};
