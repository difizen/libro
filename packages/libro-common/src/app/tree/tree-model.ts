/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Event, WaitUntilEvent, CancellationToken } from '../../common/index.js';
import { Emitter, DisposableCollection } from '../../common/index.js';
import type { SelectionProvider } from '../../core/index.js';
import { inject, singleton, postConstruct } from '../../ioc/index.js';

import type { TreeNode } from './tree.js';
import { Tree, CompositeTreeNode } from './tree.js';
import { TreeExpansionService, ExpandableTreeNode } from './tree-expansion.js';
import type { TreeIterator } from './tree-iterator.js';
import { TreeNavigationService } from './tree-navigation.js';
import {
  TreeSelectionService,
  SelectableTreeNode,
  TreeSelection,
} from './tree-selection.js';
// import { BottomUpTreeIterator, TopDownTreeIterator, Iterators } from './tree-iterator';

/**
 * The tree model.
 */
export const TreeModel = Symbol('TreeModel');
export type TreeModel = {
  /**
   * Expands the given node. If the `node` argument is `undefined`, then expands the currently selected tree node.
   * If multiple tree nodes are selected, expands the most recently selected tree node.
   */
  expandNode: (
    node?: Readonly<ExpandableTreeNode>,
  ) => Promise<Readonly<ExpandableTreeNode> | undefined>;

  /**
   * Collapses the given node. If the `node` argument is `undefined`, then collapses the currently selected tree node.
   * If multiple tree nodes are selected, collapses the most recently selected tree node.
   */
  collapseNode: (node?: Readonly<ExpandableTreeNode>) => Promise<boolean>;

  /**
   * Collapses recursively. If the `node` argument is `undefined`, then collapses the currently selected tree node.
   * If multiple tree nodes are selected, collapses the most recently selected tree node.
   */
  collapseAll: (node?: Readonly<CompositeTreeNode>) => Promise<boolean>;

  /**
   * Toggles the expansion state of the given node. If not give, then it toggles the expansion state of the currently selected node.
   * If multiple nodes are selected, then the most recently selected tree node's expansion state will be toggled.
   */
  toggleNodeExpansion: (node?: Readonly<ExpandableTreeNode>) => Promise<void>;

  /**
   * Opens the given node or the currently selected on if the argument is `undefined`.
   * If multiple nodes are selected, open the most recently selected node.
   */
  openNode: (node?: Readonly<TreeNode> | undefined) => void;

  /**
   * Event when a node should be opened.
   */
  readonly onOpenNode: Event<Readonly<TreeNode>>;

  /**
   * Selects the parent node relatively to the selected taking into account node expansion.
   */
  selectParent: () => void;

  /**
   * Navigates to the given node if it is defined. This method accepts both the tree node and its ID as an argument.
   * Navigation sets a node as a root node and expand it. Resolves to the node if the navigation was successful. Otherwise,
   * resolves to `undefined`.
   */
  navigateTo: (
    nodeOrId: Readonly<TreeNode> | string | undefined,
  ) => Promise<TreeNode | undefined>;
  /**
   * Tests whether it is possible to navigate forward.
   */
  canNavigateForward: () => boolean;

  /**
   * Tests whether it is possible to navigate backward.
   */
  canNavigateBackward: () => boolean;

  /**
   * Navigates forward.
   */
  navigateForward: () => Promise<void>;
  /**
   * Navigates backward.
   */
  navigateBackward: () => Promise<void>;

  /**
   * Selects the previous node relatively to the currently selected one. This method takes the expansion state of the tree into consideration.
   */
  selectPrevNode: (type?: TreeSelection.SelectionType) => void;

  /**
   * Returns the previous selectable tree node.
   */
  getPrevSelectableNode: (node?: TreeNode) => SelectableTreeNode | undefined;

  /**
   * Selects the next node relatively to the currently selected one. This method takes the expansion state of the tree into consideration.
   */
  selectNextNode: (type?: TreeSelection.SelectionType) => void;

  /**
   * Returns the next selectable tree node.
   */
  getNextSelectableNode: (node?: TreeNode) => SelectableTreeNode | undefined;

  /**
   * Selects the given tree node. Has no effect when the node does not exist in the tree. Discards any previous selection state.
   */
  selectNode: (node: Readonly<SelectableTreeNode>) => void;

  /**
   * Selects the given node if it was not yet selected, or unselects it if it was. Keeps the previous selection state and updates it
   * with the current toggle selection.
   */
  toggleNode: (node: Readonly<SelectableTreeNode>) => void;

  /**
   * Selects a range of tree nodes. The target of the selection range is the argument, the from tree node is the previous selected node.
   * If no node was selected previously, invoking this method does nothing.
   */
  selectRange: (node: Readonly<SelectableTreeNode>) => void;
} & Tree &
  TreeSelectionService &
  TreeExpansionService;

@singleton({ contrib: TreeModel })
export class TreeModelImpl
  implements TreeModel, SelectionProvider<readonly Readonly<SelectableTreeNode>[]>
{
  protected readonly tree: Tree;
  protected readonly selectionService: TreeSelectionService;
  protected readonly expansionService: TreeExpansionService;
  protected readonly navigationService: TreeNavigationService;

  constructor(
    @inject(Tree) tree: Tree,
    @inject(TreeSelectionService) selectionService: TreeSelectionService,
    @inject(TreeExpansionService) expansionService: TreeExpansionService,
    @inject(TreeNavigationService) navigationService: TreeNavigationService,
  ) {
    this.tree = tree;
    this.selectionService = selectionService;
    this.expansionService = expansionService;
    this.navigationService = navigationService;
  }

  protected readonly onChangedEmitter = new Emitter<void>();
  protected readonly onOpenNodeEmitter = new Emitter<TreeNode>();
  protected readonly toDispose = new DisposableCollection();

  @postConstruct()
  protected init(): void {
    this.toDispose.push(this.tree);
    this.toDispose.push(this.tree.onChanged(() => this.fireChanged()));

    this.toDispose.push(this.selectionService);

    this.toDispose.push(this.expansionService);
    this.toDispose.push(
      this.expansionService.onExpansionChanged((node) => {
        this.fireChanged();
        this.handleExpansion(node);
      }),
    );

    this.toDispose.push(this.onOpenNodeEmitter);
    this.toDispose.push(this.onChangedEmitter);
  }

  dispose(): void {
    this.toDispose.dispose();
  }

  protected handleExpansion(node: Readonly<ExpandableTreeNode>): void {
    this.selectIfAncestorOfSelected(node);
  }

  /**
   * Select the given node if it is the ancestor of a selected node.
   */
  protected selectIfAncestorOfSelected(node: Readonly<ExpandableTreeNode>): void {
    if (
      !node.expanded &&
      [...this.selectedNodes].some((selectedNode) =>
        CompositeTreeNode.isAncestor(node, selectedNode),
      )
    ) {
      if (SelectableTreeNode.isVisible(node)) {
        this.selectNode(node);
      }
    }
  }

  get root(): TreeNode | undefined {
    return this.tree.root;
  }

  set root(root: TreeNode | undefined) {
    this.tree.root = root;
  }

  get onChanged(): Event<void> {
    return this.onChangedEmitter.event;
  }

  get onOpenNode(): Event<TreeNode> {
    return this.onOpenNodeEmitter.event;
  }

  protected fireChanged(): void {
    this.onChangedEmitter.fire(undefined);
  }

  get onNodeRefreshed(): Event<Readonly<CompositeTreeNode> & WaitUntilEvent> {
    return this.tree.onNodeRefreshed;
  }

  getNode(id: string | undefined): TreeNode | undefined {
    return this.tree.getNode(id);
  }

  validateNode(node: TreeNode | undefined): TreeNode | undefined {
    return this.tree.validateNode(node);
  }

  async refresh(
    parent?: Readonly<CompositeTreeNode>,
  ): Promise<CompositeTreeNode | undefined> {
    if (parent) {
      return this.tree.refresh(parent);
    }
    return this.tree.refresh();
  }

  // tslint:disable-next-line:typedef
  get selectedNodes() {
    return this.selectionService.selectedNodes;
  }

  // tslint:disable-next-line:typedef
  get onSelectionChanged() {
    return this.selectionService.onSelectionChanged;
  }

  get onExpansionChanged(): Event<Readonly<ExpandableTreeNode>> {
    return this.expansionService.onExpansionChanged;
  }

  async expandNode(
    raw?: Readonly<ExpandableTreeNode>,
  ): Promise<ExpandableTreeNode | undefined> {
    for (const node of raw ? [raw] : this.selectedNodes) {
      if (ExpandableTreeNode.is(node)) {
        return this.expansionService.expandNode(node);
      }
    }
    return undefined;
  }

  async collapseNode(raw?: Readonly<ExpandableTreeNode>): Promise<boolean> {
    for (const node of raw ? [raw] : this.selectedNodes) {
      if (ExpandableTreeNode.is(node)) {
        return this.expansionService.collapseNode(node);
      }
    }
    return false;
  }

  async collapseAll(raw?: Readonly<CompositeTreeNode>): Promise<boolean> {
    const node = raw || this.selectedNodes[0];
    if (SelectableTreeNode.is(node)) {
      this.selectNode(node);
    }
    if (CompositeTreeNode.is(node)) {
      return this.expansionService.collapseAll(node);
    }
    return false;
  }

  toggleNodeExpansion = async (raw?: Readonly<ExpandableTreeNode>): Promise<void> => {
    for (const node of raw ? [raw] : this.selectedNodes) {
      if (ExpandableTreeNode.is(node)) {
        await this.expansionService.toggleNodeExpansion(node);
        return;
      }
    }
  };

  selectPrevNode(
    type: TreeSelection.SelectionType = TreeSelection.SelectionType.DEFAULT,
  ): void {
    const node = this.getPrevSelectableNode();
    if (node) {
      this.addSelection({ node, type });
    }
  }

  getPrevSelectableNode(
    node: TreeNode = this.selectedNodes[0],
  ): SelectableTreeNode | undefined {
    const iterator = this.createBackwardIterator(node);
    return iterator && this.doGetNextNode(iterator);
  }

  selectNextNode(
    type: TreeSelection.SelectionType = TreeSelection.SelectionType.DEFAULT,
  ): void {
    const node = this.getNextSelectableNode();
    if (node) {
      this.addSelection({ node, type });
    }
  }

  getNextSelectableNode(
    node: TreeNode = this.selectedNodes[0],
  ): SelectableTreeNode | undefined {
    const iterator = this.createIterator(node);
    return iterator && this.doGetNextNode(iterator);
  }

  protected doGetNextNode(iterator: TreeIterator): SelectableTreeNode | undefined {
    // Skip the first item.
    iterator.next();
    let result = iterator.next();
    while (!result.done && !SelectableTreeNode.isVisible(result.value)) {
      result = iterator.next();
    }
    const node = result.value;
    if (SelectableTreeNode.isVisible(node)) {
      return node;
    }
    return undefined;
  }

  protected createBackwardIterator(
    _node: TreeNode | undefined,
  ): TreeIterator | undefined {
    return undefined;
  }

  protected createIterator(_node: TreeNode | undefined): TreeIterator | undefined {
    return undefined;
  }

  openNode(raw?: TreeNode | undefined): void {
    const node = raw || this.selectedNodes[0];
    if (node) {
      this.doOpenNode(node);
      this.onOpenNodeEmitter.fire(node);
    }
  }

  protected doOpenNode(node: TreeNode): void {
    if (ExpandableTreeNode.is(node)) {
      this.toggleNodeExpansion(node);
    }
  }

  selectParent(): void {
    if (this.selectedNodes.length === 1) {
      const node = this.selectedNodes[0];
      const parent = SelectableTreeNode.getVisibleParent(node);
      if (parent) {
        this.selectNode(parent);
      }
    }
  }

  async navigateTo(
    nodeOrId: TreeNode | string | undefined,
  ): Promise<TreeNode | undefined> {
    if (nodeOrId) {
      const node = typeof nodeOrId === 'string' ? this.getNode(nodeOrId) : nodeOrId;
      if (node) {
        this.navigationService.push(node);
        await this.doNavigate(node);
        return node;
      }
    }
    return undefined;
  }

  canNavigateForward(): boolean {
    return !!this.navigationService.next;
  }

  canNavigateBackward(): boolean {
    return !!this.navigationService.prev;
  }

  async navigateForward(): Promise<void> {
    const node = this.navigationService.advance();
    if (node) {
      await this.doNavigate(node);
    }
  }

  async navigateBackward(): Promise<void> {
    const node = this.navigationService.retreat();
    if (node) {
      await this.doNavigate(node);
    }
  }

  protected async doNavigate(node: TreeNode): Promise<void> {
    this.tree.root = node;
    if (ExpandableTreeNode.is(node)) {
      await this.expandNode(node);
    }
    if (SelectableTreeNode.is(node)) {
      this.selectNode(node);
    }
  }

  addSelection(
    selectionOrTreeNode: TreeSelection | Readonly<SelectableTreeNode>,
  ): void {
    this.selectionService.addSelection(selectionOrTreeNode);
  }

  selectNode(node: Readonly<SelectableTreeNode>): void {
    this.addSelection(node);
  }

  toggleNode(node: Readonly<SelectableTreeNode>): void {
    this.addSelection({ node, type: TreeSelection.SelectionType.TOGGLE });
  }

  selectRange(node: Readonly<SelectableTreeNode>): void {
    this.addSelection({ node, type: TreeSelection.SelectionType.RANGE });
  }

  storeState(): TreeModelImpl.State {
    return {
      selection: this.selectionService.storeState(),
    };
  }

  restoreState(state: Record<string, any>): void {
    if (state['selection']) {
      this.selectionService.restoreState(state['selection']);
    }
  }

  get onDidChangeBusy(): Event<TreeNode> {
    return this.tree.onDidChangeBusy;
  }

  markAsBusy(
    node: Readonly<TreeNode>,
    ms: number,
    token: CancellationToken,
  ): Promise<void> {
    return this.tree.markAsBusy(node, ms, token);
  }
}
export namespace TreeModelImpl {
  export type State = {
    selection: object;
  };
}
