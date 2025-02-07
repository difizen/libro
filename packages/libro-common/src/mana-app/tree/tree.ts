import type {
  Event,
  Disposable,
  CancellationToken,
  WaitUntilEvent,
} from '@difizen/mana-common';

import type { NodeProps, TreeProps } from './tree-protocol';

export const Tree = Symbol('Tree');

/**
 * The tree - an abstract data type.
 */
export type Tree = {
  /**
   * A root node of this tree.
   * Undefined if there is no root node.
   * Setting a root node refreshes the tree.
   */
  root: TreeNode | undefined;
  /**
   * Emit when the tree is changed.
   */
  readonly onChanged: Event<void>;
  /**
   * Return a node for the given identifier or undefined if such does not exist.
   */
  getNode: (id: string | undefined) => TreeNode | undefined;
  /**
   * Return a valid node in this tree matching to the given; otherwise undefined.
   */
  validateNode: (node: TreeNode | undefined) => TreeNode | undefined;
  /**
   * Refresh children of the r../../../../examples/application-react/utils.
   *
   * Return a valid refreshed composite root or `undefined` if such does not exist.
   */
  refresh: (() => Promise<Readonly<CompositeTreeNode> | undefined>) &
    ((
      parent: Readonly<CompositeTreeNode>,
    ) => Promise<Readonly<CompositeTreeNode> | undefined>);
  /**
   * Emit when the children of the given node are refreshed.
   */
  readonly onNodeRefreshed: Event<Readonly<CompositeTreeNode> & WaitUntilEvent>;
  /**
   * Emits when the busy state of the given node is changed.
   */
  readonly onDidChangeBusy: Event<TreeNode>;
  /**
   * Marks the give node as busy after a specified number of milliseconds.
   * A token source of the given token should be canceled to unmark.
   */
  markAsBusy: (
    node: Readonly<TreeNode>,
    ms: number,
    token: CancellationToken,
  ) => Promise<void>;
} & Disposable;

/**
 * The tree node.
 */
export type TreeNode = {
  /**
   * An unique id of this node.
   */
  readonly id: string;
  readonly icon?: string;
  readonly description?: string;
  /**
   * Test whether this node should be rendered.
   * If undefined then node will be rendered.
   */
  readonly visible?: boolean;
  /**
   * A parent node of this tree node.
   * Undefined if this node is root.
   */
  readonly parent: Readonly<CompositeTreeNode> | undefined;
  /**
   * A previous sibling of this tree node.
   */
  readonly previousSibling?: TreeNode;
  /**
   * A next sibling of this tree node.
   */
  readonly nextSibling?: TreeNode;
  /**
   * Whether this node is busy. Greater than 0 then busy; otherwise not.
   */
  readonly busy?: number;

  readonly name?: string;
};

export namespace TreeNode {
  export function is(node: Record<any, any> | undefined): node is TreeNode {
    return !!node && typeof node === 'object' && 'id' in node && 'parent' in node;
  }

  export function equals(
    left: TreeNode | undefined,
    right: TreeNode | undefined,
  ): boolean {
    return left === right || (!!left && !!right && left.id === right.id);
  }

  export function isVisible(node: TreeNode | undefined): boolean {
    return !!node && (node.visible === undefined || node.visible);
  }
}

/**
 * The composite tree node.
 */
export type CompositeTreeNode = {
  /**
   * Child nodes of this tree node.
   */
  children: readonly TreeNode[];
} & TreeNode;

export namespace CompositeTreeNode {
  export function is(node: Record<any, any> | undefined): node is CompositeTreeNode {
    return !!node && 'children' in node;
  }

  export function getFirstChild(parent: CompositeTreeNode): TreeNode | undefined {
    return parent.children[0];
  }

  export function getLastChild(parent: CompositeTreeNode): TreeNode | undefined {
    return parent.children[parent.children.length - 1];
  }

  export function isAncestor(
    parent: CompositeTreeNode,
    child: TreeNode | undefined,
  ): boolean {
    if (!child) {
      return false;
    }
    if (TreeNode.equals(parent, child.parent)) {
      return true;
    }
    return isAncestor(parent, child.parent);
  }

  export function indexOf(
    parent: CompositeTreeNode,
    node: TreeNode | undefined,
  ): number {
    if (!node) {
      return -1;
    }
    return parent.children.findIndex((child) => TreeNode.equals(node, child));
  }

  export function addChildren(
    parent: CompositeTreeNode,
    children: TreeNode[],
  ): CompositeTreeNode {
    for (const child of children) {
      addChild(parent, child);
    }
    return parent;
  }

  export function addChild(
    parent: CompositeTreeNode,
    child: TreeNode,
  ): CompositeTreeNode {
    const children = parent.children as TreeNode[];
    const index = children.findIndex((value) => value.id === child.id);
    if (index !== -1) {
      children.splice(index, 1, child);
      setParent(child, index, parent);
    } else {
      children.push(child);
      setParent(child, parent.children.length - 1, parent);
    }
    return parent;
  }

  export function removeChild(parent: CompositeTreeNode, child: TreeNode): void {
    const children = parent.children as TreeNode[];
    const index = children.findIndex((value) => value.id === child.id);
    if (index === -1) {
      return;
    }
    children.splice(index, 1);
    const { previousSibling, nextSibling } = child;
    if (previousSibling) {
      Object.assign(previousSibling, { nextSibling });
    }
    if (nextSibling) {
      Object.assign(nextSibling, { previousSibling });
    }
  }

  export function setParent(
    child: TreeNode,
    index: number,
    parent: CompositeTreeNode,
  ): void {
    const previousSibling = parent.children[index - 1];
    const nextSibling = parent.children[index + 1];
    Object.assign(child, { parent, previousSibling, nextSibling });
    if (previousSibling) {
      Object.assign(previousSibling, { nextSibling: child });
    }
    if (nextSibling) {
      Object.assign(nextSibling, { previousSibling: child });
    }
  }
}

/**
 * Representation of a tree node row.
 */
export type NodeRow = {
  /**
   * The node row index.
   */
  index: number;
  /**
   * The actual node.
   */
  node: TreeNode;
  /**
   * A root relative number representing the hierarchical depth of the actual node. Root is `0`, its children have `1` and so on.
   */
  depth: number;
};

export interface TreeNodeProps {
  node: TreeNode;
  nodeProps: NodeProps;
}

export interface TreeNodeCaptionAffixesProps extends TreeNodeProps {
  affixKey: 'captionPrefixes' | 'captionSuffixes';
}

export interface TreeNodeIconDecoratorProps extends TreeNodeProps {
  icon: React.ReactNode;
}

export interface TreeNodeComponents {
  TreeNodeExpansion: React.FC<TreeNodeProps>;
  TreeNode: React.FC<TreeNodeProps>;
  TreeNodeIcon: React.FC<TreeNodeProps>;
  TreeNodeCaption: React.FC<TreeNodeProps>;
  TreeNodeCaptionAffixes: React.FC<TreeNodeCaptionAffixesProps>;
  TreeNodeTailDecorations: React.FC<TreeNodeProps>;
  TreeNodeIconDecorator: React.FC<TreeNodeIconDecoratorProps>;
  TreeIdent: React.FC<TreeNodeProps>;
  TreeSwitchIcon: React.FC<TreeNodeProps>;
}
export const TreeNodeComponents = Symbol('TreeNodeComponents');

/**
 * Bare minimum common interface of the keyboard and the mouse event with respect to the key maskings.
 */
export type ModifierAwareEvent = {
  /**
   * Determines if the modifier aware event has the `meta` key masking.
   */
  readonly metaKey: boolean;
  /**
   * Determines if the modifier aware event has the `ctrl` key masking.
   */
  readonly ctrlKey: boolean;
  /**
   * Determines if the modifier aware event has the `shift` key masking.
   */
  readonly shiftKey: boolean;
};

/**
 * The default tree properties.
 */
export const DefaultTreeProps: TreeProps = {
  leftPadding: 8,
  expansionTogglePadding: 18,
};
