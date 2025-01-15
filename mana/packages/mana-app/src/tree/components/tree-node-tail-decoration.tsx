import { notEmpty } from '@difizen/mana-common';
import { ViewInstance } from '@difizen/mana-core';
import { useInject } from '@difizen/mana-observable';
import * as React from 'react';

import type { TreeNodeProps } from '../tree';
import { TREE_NODE_SEGMENT_CLASS, TREE_NODE_TAIL_CLASS } from '../tree-protocol';
import type { TreeViewDecoration } from '../tree-view-decoration';
import type { TreeView } from '../view/tree-view';
import { TreeViewDecorator } from '../view/tree-view-decorator';

export function TreeNodeTailDecorations(props: TreeNodeProps) {
  const { node } = props;
  const treeViewDecorator = useInject<TreeViewDecorator>(TreeViewDecorator);
  const treeView = useInject<TreeView>(ViewInstance);
  return (
    <React.Fragment>
      {treeViewDecorator
        .getDecorationData(node, 'tailDecorations')
        .filter(notEmpty)
        .reduce((acc, current) => acc.concat(current), [])
        .map((decoration, index) => {
          const { tooltip } = decoration;
          const { data, fontData } = decoration as TreeViewDecoration.TailDecoration;
          const { color } = decoration as TreeViewDecoration.TailDecorationIcon;
          const icon =
            (decoration as TreeViewDecoration.TailDecorationIcon).icon ||
            (decoration as TreeViewDecoration.TailDecorationIconClass).iconClass;
          const className = [TREE_NODE_SEGMENT_CLASS, TREE_NODE_TAIL_CLASS].join(' ');
          // eslint-disable-next-line no-nested-ternary
          const style = fontData
            ? treeView.applyFontStyles({}, fontData)
            : color
              ? { color }
              : undefined;
          const content =
            data ||
            (icon ? (
              <span
                key={`${node.id}icon${index}`}
                className={treeView.getIconClass(icon)}
              ></span>
            ) : (
              ''
            ));
          return (
            <div
              key={node.id + className + index}
              className={className}
              style={style}
              title={tooltip}
            >
              {content}
            </div>
          );
        })}
    </React.Fragment>
  );
}
