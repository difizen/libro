import { ViewInstance } from '../../../core/index.js';
import { useInject } from '../../../observable/index.js';
import * as React from 'react';

import { notEmpty } from '../../../common/index.js';
import type { TreeNodeProps } from '../tree.js';
import { TREE_NODE_SEGMENT_CLASS, TREE_NODE_TAIL_CLASS } from '../tree-protocol.js';
import type { TreeViewDecoration } from '../tree-view-decoration.js';
import type { TreeView } from '../view/tree-view.js';
import { TreeViewDecorator } from '../view/tree-view-decorator.js';

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
