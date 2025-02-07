import type { MenuPath } from '@difizen/mana-core';

export const TREE_CLASS = 'mana-tree';
export const TREE_CONTAINER_CLASS = 'mana-tree-container';
export const TREE_NODE_CLASS = 'mana-tree-node';
export const TREE_NODE_CONTENT_CLASS = 'mana-tree-node-content';
export const TREE_NODE_TAIL_CLASS = 'mana-tree-node-tail';
export const TREE_NODE_SEGMENT_CLASS = 'mana-tree-node-segment';
export const TREE_NODE_SEGMENT_GROW_CLASS = 'mana-tree-node-segment-grow';

export const EXPANDABLE_TREE_NODE_CLASS = 'mana-expandable-tree-node';
export const COMPOSITE_TREE_NODE_CLASS = 'mana-composite-tree-node';
export const TREE_NODE_CAPTION_CLASS = 'mana-tree-node-caption';
export const TREE_NODE_INDENT_GUIDE_CLASS = 'mana-tree-node-indent';
/**
 * Representation of the tree force update options.
 */
export type ForceUpdateOptions = {
  /**
   * Controls whether to force a resize of the widget.
   */
  resize: boolean;
};
export const TreeProps = Symbol('TreeProps');

/**
 * Representation of tree properties.
 */
export type TreeProps = {
  /**
   * The path of the context menu that one can use to contribute context menu items to the tree widget.
   */
  readonly contextMenuPath?: MenuPath;

  /**
   * The size of the padding (in pixels) per hierarchy depth. The root element won't have left padding but
   * the padding for the children will be calculated as `leftPadding * hierarchyDepth` and so on.
   */
  readonly leftPadding: number;

  readonly expansionTogglePadding: number;

  /**
   * `true` if the tree widget support multi-selection. Otherwise, `false`. Defaults to `false`.
   */
  readonly multiSelect?: boolean;

  /**
   * `true` if the tree widget support searching. Otherwise, `false`. Defaults to `false`.
   */
  readonly search?: boolean;

  /**
   * `true` if the tree widget should be virtualized searching. Otherwise, `false`. Defaults to `true`.
   */
  readonly virtualized?: boolean;

  /**
   * `true` if the selected node should be auto scrolled only if the widget is active. Otherwise, `false`. Defaults to `false`.
   */
  readonly scrollIfActive?: boolean;

  /**
   * `true` if a tree widget contributes to the global selection. Defaults to `false`.
   */
  readonly globalSelection?: boolean;
};

/**
 * Representation of node properties.
 */
export type NodeProps = {
  /**
   * A root relative number representing the hierarchical depth of the actual node. Root is `0`, its children have `1` and so on.
   */
  readonly depth: number;
};
