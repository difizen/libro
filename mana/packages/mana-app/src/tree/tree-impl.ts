import type { Mutable, Event, CancellationToken } from '@difizen/mana-common';
import { timeout } from '@difizen/mana-common';
import { CancellationTokenSource } from '@difizen/mana-common';
import { DisposableCollection } from '@difizen/mana-common';
import { Emitter, WaitUntilEvent } from '@difizen/mana-common';
import { getOrigin, equals } from '@difizen/mana-observable';
import { singleton } from '@difizen/mana-syringe';

import type { TreeNode } from './tree';
import { Tree, CompositeTreeNode } from './tree';

/**
 * A default implementation of the tree.
 */
@singleton({ token: Tree })
export class TreeImpl implements Tree {
  protected _root: TreeNode | undefined;
  protected readonly onChangedEmitter = new Emitter<void>();
  protected readonly onNodeRefreshedEmitter = new Emitter<
    CompositeTreeNode & WaitUntilEvent
  >();
  protected readonly toDispose = new DisposableCollection();

  protected readonly onDidChangeBusyEmitter = new Emitter<TreeNode>();
  readonly onDidChangeBusy = this.onDidChangeBusyEmitter.event;

  protected nodes: Record<string, Mutable<TreeNode> | undefined> = {};

  constructor() {
    this.toDispose.push(this.onChangedEmitter);
    this.toDispose.push(this.onNodeRefreshedEmitter);
    this.toDispose.push(this.onDidChangeBusyEmitter);
  }

  dispose(): void {
    this.nodes = {};
    this.toDispose.dispose();
  }

  get root(): TreeNode | undefined {
    return this._root;
  }

  set root(root: TreeNode | undefined) {
    this.nodes = {};
    this._root = root;
    this.addNode(root);
    this.refresh();
  }

  get onChanged(): Event<void> {
    return this.onChangedEmitter.event;
  }

  protected fireChanged(): void {
    this.onChangedEmitter.fire(undefined);
  }

  get onNodeRefreshed(): Event<CompositeTreeNode & WaitUntilEvent> {
    return this.onNodeRefreshedEmitter.event;
  }

  protected async fireNodeRefreshed(parent: CompositeTreeNode): Promise<void> {
    await WaitUntilEvent.fire(this.onNodeRefreshedEmitter, parent);
    this.fireChanged();
  }

  getNode = (id: string | undefined): TreeNode | undefined => {
    return id !== undefined ? this.nodes[id] : undefined;
  };

  validateNode = (node: TreeNode | undefined): TreeNode | undefined => {
    const id = node ? node.id : undefined;
    return this.getNode(id);
  };

  async refresh(raw?: CompositeTreeNode): Promise<CompositeTreeNode | undefined> {
    const parent = !raw ? this._root : this.validateNode(raw);
    let result: CompositeTreeNode | undefined;
    if (CompositeTreeNode.is(parent)) {
      const busySource = new CancellationTokenSource();
      this.doMarkAsBusy(parent, 800, busySource.token);
      try {
        result = parent;
        const children = await this.resolveChildren(parent);
        result = await this.setChildren(parent, children);
      } finally {
        busySource.cancel();
      }
    }
    this.fireChanged();
    return result;
  }

  protected resolveChildren(parent: CompositeTreeNode): Promise<TreeNode[]> {
    return Promise.resolve(Array.from(parent.children));
  }

  protected setChildren = async (
    parent: CompositeTreeNode,
    children: TreeNode[],
  ): Promise<CompositeTreeNode | undefined> => {
    const root = this.getRootNode(parent);
    if (this.nodes[root.id] && !equals(this.nodes[root.id], root)) {
      console.error(
        `Child node '${parent.id}' does not belong to this '${root.id}' tree.`,
      );
      return undefined;
    }
    this.removeNode(parent);
    parent.children = children;
    this.addNode(parent);
    await this.fireNodeRefreshed(parent);
    return parent;
  };

  protected removeNode = (node: TreeNode | undefined): void => {
    if (CompositeTreeNode.is(node)) {
      node.children.forEach((child) => this.removeNode(child));
    }
    if (node) {
      delete this.nodes[node.id];
    }
  };

  protected getRootNode(node: TreeNode): TreeNode {
    if (node.parent === undefined) {
      return node;
    }
    return this.getRootNode(node.parent);
  }

  protected addNode(node: TreeNode | undefined): void {
    if (node) {
      this.nodes[node.id] = node;
    }
    if (CompositeTreeNode.is(node)) {
      const { children } = getOrigin(node);
      children.forEach((child, index) => {
        CompositeTreeNode.setParent(child, index, node);
        this.addNode(child);
      });
    }
  }

  async markAsBusy(raw: TreeNode, ms: number, token: CancellationToken): Promise<void> {
    const node = this.validateNode(raw);
    if (node) {
      await this.doMarkAsBusy(node, ms, token);
    }
  }
  protected async doMarkAsBusy(
    node: Mutable<TreeNode>,
    ms: number,
    token: CancellationToken,
  ): Promise<void> {
    try {
      await timeout(ms, token);
      this.doSetBusy(node);
      token.onCancellationRequested(() => this.doResetBusy(node));
    } catch {
      /* no-op */
    }
  }
  protected doSetBusy(node: Mutable<TreeNode>): void {
    const oldBusy = node.busy || 0;
    node.busy = oldBusy + 1;
    if (oldBusy === 0) {
      this.onDidChangeBusyEmitter.fire(node);
    }
  }
  protected doResetBusy(node: Mutable<TreeNode>): void {
    const oldBusy = node.busy || 0;
    if (oldBusy > 0) {
      node.busy = oldBusy - 1;
      if (node.busy === 0) {
        this.onDidChangeBusyEmitter.fire(node);
      }
    }
  }
}
