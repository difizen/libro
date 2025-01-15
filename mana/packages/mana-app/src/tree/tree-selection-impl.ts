import type { Event } from '@difizen/mana-common';
import { Emitter } from '@difizen/mana-common';
import { singleton, inject, postConstruct } from '@difizen/mana-syringe';

import type { TreeNode } from './tree';
import { Tree } from './tree';
import {
  TreeSelectionService,
  SelectableTreeNode,
  TreeSelection,
} from './tree-selection';
import type { FocusableTreeSelection } from './tree-selection-state';
import { TreeSelectionState } from './tree-selection-state';

@singleton({ contrib: TreeSelectionService })
export class TreeSelectionServiceImpl implements TreeSelectionService {
  protected readonly tree: Tree;
  constructor(
    @inject(Tree)
    tree: Tree,
  ) {
    this.tree = tree;
  }
  protected readonly onSelectionChangedEmitter = new Emitter<
    readonly Readonly<SelectableTreeNode>[]
  >();

  protected state?: TreeSelectionState;

  @postConstruct()
  protected init(): void {
    this.state = new TreeSelectionState(this.tree);
  }

  dispose(): void {
    this.onSelectionChangedEmitter.dispose();
  }

  get selectedNodes(): readonly Readonly<SelectableTreeNode>[] {
    return this.state!.selection();
  }

  get onSelectionChanged(): Event<readonly Readonly<SelectableTreeNode>[]> {
    return this.onSelectionChangedEmitter.event;
  }

  protected fireSelectionChanged(): void {
    this.onSelectionChangedEmitter.fire(this.state!.selection());
  }

  addSelection(
    selectionOrTreeNode: TreeSelection | Readonly<SelectableTreeNode>,
  ): void {
    const selection = ((
      arg: TreeSelection | Readonly<SelectableTreeNode>,
    ): TreeSelection => {
      const type = TreeSelection.SelectionType.DEFAULT;
      if (TreeSelection.is(arg)) {
        return {
          type,
          ...arg,
        };
      }
      return {
        type,
        node: arg,
      };
    })(selectionOrTreeNode);

    const node = this.validateNode(selection.node);
    if (node === undefined) {
      return;
    }
    Object.assign(selection, { node });

    const newState = this.state!.nextState(selection);
    this.transiteTo(newState);
  }

  protected transiteTo(newState: TreeSelectionState): void {
    const oldNodes = this.state!.selection();
    const newNodes = newState.selection();

    const toUnselect = this.difference(oldNodes, newNodes);
    const toSelect = this.difference(newNodes, oldNodes);

    this.unselect(toUnselect);
    this.select(toSelect);
    this.removeFocus(oldNodes, newNodes);
    this.addFocus(newState.focus);

    this.state = newState;
    this.fireSelectionChanged();
  }

  protected unselect(nodes: readonly SelectableTreeNode[]): void {
    nodes.forEach((node) => (node.selected = false));
  }

  protected select(nodes: readonly SelectableTreeNode[]): void {
    nodes.forEach((node) => (node.selected = true));
  }

  protected removeFocus(...nodes: (readonly SelectableTreeNode[])[]): void {
    nodes.forEach((node) => node.forEach((n) => (n.focus = false)));
  }

  protected addFocus(node: SelectableTreeNode | undefined): void {
    if (node) {
      node.focus = true;
    }
  }

  /**
   * Returns an array of the difference of two arrays. The returned array contains all elements that are contained by
   * `left` and not contained by `right`. `right` may also contain elements not present in `left`: these are simply ignored.
   */
  protected difference<T>(left: readonly T[], right: readonly T[]): readonly T[] {
    return left.filter((item) => right.indexOf(item) === -1);
  }

  /**
   * Returns a reference to the argument if the node exists in the tree. Otherwise, `undefined`.
   */
  protected validateNode(node: Readonly<TreeNode>): Readonly<TreeNode> | undefined {
    const result = this.tree.validateNode(node);
    return SelectableTreeNode.is(result) ? result : undefined;
  }

  storeState(): TreeSelectionServiceImpl.State {
    return {
      selectionStack: this.state!.selectionStack.map((s) => ({
        focus: (s.focus && s.focus.id) || undefined,
        node: (s.node && s.node.id) || undefined,
        type: s.type,
      })),
    };
  }

  restoreState(state: Record<string, any>): void {
    const selectionStack: FocusableTreeSelection[] = [];
    for (const selection of state['selectionStack']) {
      const node = (selection.node && this.tree.getNode(selection.node)) || undefined;
      if (!SelectableTreeNode.is(node)) {
        break;
      }
      const focus =
        (selection.focus && this.tree.getNode(selection.focus)) || undefined;
      selectionStack.push({
        node,
        focus: (SelectableTreeNode.is(focus) && focus) || undefined,
        type: selection.type,
      });
    }
    if (selectionStack.length) {
      this.transiteTo(new TreeSelectionState(this.tree, selectionStack));
    }
  }
}
export namespace TreeSelectionServiceImpl {
  export type State = {
    selectionStack: readonly FocusableTreeSelectionState[];
  };
  export type FocusableTreeSelectionState = {
    focus?: string | undefined;
    node?: string | undefined;
    type?: TreeSelection.SelectionType | undefined;
  };
}
