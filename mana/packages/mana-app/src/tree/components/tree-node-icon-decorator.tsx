import { notEmpty } from '@difizen/mana-common';
import { ViewInstance } from '@difizen/mana-core';
import { useInject } from '@difizen/mana-observable';
import * as React from 'react';

import type { TreeNodeIconDecoratorProps } from '../tree';
import type { TreeViewDecoration } from '../tree-view-decoration';
import { IconOverlayPosition, TreeViewDecorationStyles } from '../tree-view-decoration';
import type { TreeView } from '../view/tree-view';
import { TreeViewDecorator } from '../view/tree-view-decorator';

export const TreeNodeIconDecorator: React.FC<TreeNodeIconDecoratorProps> = (
  props: TreeNodeIconDecoratorProps,
) => {
  const treeViewDecorator = useInject<TreeViewDecorator>(TreeViewDecorator);
  const treeView = useInject<TreeView>(ViewInstance);
  const { icon, node } = props;
  if (icon === null) {
    return null;
  }

  const overlayIcons: React.ReactNode[] = [];
  new Map(
    treeViewDecorator
      .getDecorationData(node, 'iconOverlay')
      .reverse()
      .filter(notEmpty)
      .map(
        (overlay) =>
          [overlay.position, overlay] as [
            IconOverlayPosition,
            TreeViewDecoration.IconOverlay | TreeViewDecoration.IconClassOverlay,
          ],
      ),
  ).forEach((overlay, position) => {
    const iconClasses = [
      TreeViewDecorationStyles.DECORATOR_SIZE_CLASS,
      IconOverlayPosition.getStyle(position),
    ];
    const style = (color?: string) => (color === undefined ? {} : { color });
    if (overlay.background) {
      overlayIcons.push(
        <span
          key={`${node.id}bg`}
          className={treeView.getIconClass(overlay.background.shape, iconClasses)}
          style={style(overlay.background.color)}
        ></span>,
      );
    }
    const overlayIcon =
      (overlay as TreeViewDecoration.IconOverlay).icon ||
      (overlay as TreeViewDecoration.IconClassOverlay).iconClass;
    overlayIcons.push(
      <span
        key={node.id}
        className={treeView.getIconClass(overlayIcon, iconClasses)}
        style={style(overlay.color)}
      ></span>,
    );
  });

  if (overlayIcons.length > 0) {
    return (
      <div className={TreeViewDecorationStyles.ICON_WRAPPER_CLASS}>
        {icon}
        {overlayIcons}
      </div>
    );
  }

  return icon as React.ReactElement;
};
