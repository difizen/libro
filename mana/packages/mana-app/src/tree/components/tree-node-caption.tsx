import { notEmpty } from '@difizen/mana-common';
import { ViewInstance } from '@difizen/mana-core';
import { useInject } from '@difizen/mana-observable';
import * as React from 'react';

import type { TreeNodeProps } from '../tree';
import {
  TREE_NODE_SEGMENT_CLASS,
  TREE_NODE_SEGMENT_GROW_CLASS,
} from '../tree-protocol';
import { TreeViewDecorationStyles, CaptionHighlight } from '../tree-view-decoration';
import type { TreeView } from '../view/tree-view';
import { TreeViewDecorator } from '../view/tree-view-decorator';

export function TreeNodeCaption(props: TreeNodeProps) {
  const { node } = props;
  const treeViewDecorator = useInject<TreeViewDecorator>(TreeViewDecorator);
  const treeView = useInject<TreeView>(ViewInstance);
  /**
   * Determine if the tree node contains trailing suffixes.
   * @param node the tree node.
   *
   * @returns `true` if the tree node contains trailing suffices.
   */
  const hasTrailingSuffixes = (): boolean => {
    return (
      treeViewDecorator
        .getDecorationData(node, 'captionSuffixes')
        .filter(notEmpty)
        .reduce((acc, current) => acc.concat(current), []).length > 0
    );
  };
  /**
   * Decorate the tree caption.
   * @param node the tree node.
   * @param attrs the additional attributes.
   */
  const decorateCaption = (
    attrs: React.HTMLAttributes<HTMLElement>,
  ): React.Attributes & React.HTMLAttributes<HTMLElement> => {
    const style = treeViewDecorator
      .getDecorationData(node, 'fontData')
      .filter(notEmpty)
      .reverse()
      .map((fontData) => treeView.applyFontStyles({}, fontData))
      .reduce(
        (acc, current) => ({
          ...acc,
          ...current,
        }),
        {},
      );
    return {
      ...attrs,
      style,
    };
  };

  /**
   * Update the node given the caption and highlight.
   * @param caption the caption.
   * @param highlight the tree decoration caption highlight.
   */
  const toReactNode = (
    caption: string,
    highlight: CaptionHighlight,
  ): React.ReactNode[] => {
    let style: React.CSSProperties = {};
    if (highlight.color) {
      style = {
        ...style,
        color: highlight.color,
      };
    }
    if (highlight.backgroundColor) {
      style = {
        ...style,
        backgroundColor: highlight.backgroundColor,
      };
    }
    const createChildren = (fragment: CaptionHighlight.Fragment, index: number) => {
      const { data } = fragment;
      if (fragment.highlight) {
        return (
          <mark
            className={TreeViewDecorationStyles.CAPTION_HIGHLIGHT_CLASS}
            style={style}
            key={index}
          >
            {data}
          </mark>
        );
      }
      return data;
    };
    return CaptionHighlight.split(caption, highlight).map(createChildren);
  };

  const tooltip = treeViewDecorator
    .getDecorationData(node, 'tooltip')
    .filter(notEmpty)
    .join(' • ');
  const classes = [TREE_NODE_SEGMENT_CLASS];
  if (!hasTrailingSuffixes()) {
    classes.push(TREE_NODE_SEGMENT_GROW_CLASS);
  }
  const className = classes.join(' ');
  let attrs: React.Attributes & React.HTMLAttributes<HTMLDivElement> = decorateCaption({
    className,
    id: node.id,
  });
  if (tooltip.length > 0) {
    attrs = {
      ...attrs,
      title: tooltip,
    };
  }
  const children: React.ReactNode[] = [];
  const caption = treeView.toNodeName(node);
  const highlight = treeViewDecorator.getDecorationData(node, 'highlight')[0];
  if (highlight) {
    children.push(toReactNode(caption, highlight));
  }
  if (!highlight) {
    children.push(caption);
  }
  return <div {...attrs}>{children}</div>;
}
