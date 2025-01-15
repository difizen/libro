import type { Event, Disposable, MaybePromise } from '@difizen/mana-common';
import { Emitter, DisposableCollection } from '@difizen/mana-common';
import { singleton } from '@difizen/mana-syringe';

import type { Tree, TreeNode } from './tree';
import type { TreeViewDecorationData } from './tree-view-decoration';

/**
 * The {@link TreeDecorator} allows adapting the look and the style of the tree items within a widget. Changes are reflected in
 * the form of `decoration data`. This `decoration data` is a map storing {@link TreeDecoration.Data} for affected tree nodes (using the unique node id as key).
 * It is important to notice that there is no common contribution point for `TreeDecorators`. Instead, each {@link TreeDecoratorService} is
 * supposed to declare its own contribution provider for `TreeDecorators`.
 *
 * ### Example usage
 * A simple tree decorator that changes the background color of each tree node to `red`.
 *
 * ```typescript
 * @singleton()
 * export class MyTreeDecorator implements TreeDecorator {
 *     id = 'myTreeDecorator';
 *
 *     protected readonly emitter = new Emitter<(tree: Tree) => Map<string, TreeDecoration.Data>>();
 *
 *     get onDidChangeDecorations(): Event<(tree: Tree) => Map<string, TreeDecoration.Data>> {
 *         return this.emitter.event;
 *     }
 *
 *     decorations(tree: Tree): MaybePromise<Map<string, TreeDecoration.Data>> {
 *         const result = new Map();
 *
 *         if (tree.root === undefined) {
 *             return result;
 *         }
 *         for (const treeNode of new DepthFirstTreeIterator(tree.root)) {
 *             result.set(treeNode.id,<TreeDecoration.Data>{backgroundColor:'red'})
 *         }
 *         return result;
 *     }
 * }
 * ```
 */
export type TreeDecorator = {
  /**
   * The unique identifier of the decorator. Ought to be unique in the application.
   */
  readonly id: string;

  /**
   * Fired when this decorator has calculated all the `decoration data` for the tree nodes.
   */
  readonly onDidChangeDecorations: Event<
    (tree: Tree) => Map<string, TreeViewDecorationData>
  >;

  /**
   * Computes the current `decoration data` for the given tree. Might return a promise if the computation is handled asynchronously.
   *
   * @param tree the tree to decorate.
   *
   * @returns (a promise of) a map containing the current {@linkTreeDecoration.Data} for each node. Keys are the unique identifier of the tree nodes.
   */
  decorations: (tree: Tree) => MaybePromise<Map<string, TreeViewDecorationData>>;
};

export const TreeDecoratorService = Symbol('TreeDecoratorService');

/**
 * The {@link TreeDecoratorService} manages a set of known {link TreeDecorator}s and emits events when
 * any of the known decorators has changes. Typically, a `TreeDecoratorService` provides a contribution point that can be used to
 * register {@link TreeDecorator}s exclusively for this service.
 *
 * ### Example usage
 * ```typescript
 * export const MyTreeDecorator = Symbol('MyTreeDecorator');
 *
 * @singleton()
 * export class MyDecorationService extends AbstractTreeDecoratorService {
 *     constructor(@contrib(MyTreeDecorator) protected readonly contributions: ContributionProvider<TreeDecorator>) {
 *         super(contributions.getContributions());
 *     }
 * }
 * ```
 */
export type TreeDecoratorService = {
  /**
   * Fired when any of the available tree decorators has changes.
   */
  readonly onDidChangeDecorations: Event<void>;

  /**
   * Computes the decorations for the tree based on the actual state of this decorator service.
   *
   * @param tree the tree to decorate
   *
   * @returns (a promise of) the computed `decoration data`
   */
  getDecorations: (tree: Tree) => MaybePromise<Map<string, TreeViewDecorationData[]>>;

  /**
   * Transforms the `decoration data` into an object, so that it can be safely serialized into JSON.
   * @param decorations the `decoration data` that should be deflated
   *
   * @returns the `decoration data` as serializable JSON object
   */
  deflateDecorators: (decorations: Map<string, TreeViewDecorationData[]>) => object;

  /**
   * Counterpart of the [deflateDecorators](#deflateDecorators) method. Restores the argument into a Map
   * of tree node IDs and the corresponding decorations data array (`decoration data`).
   *
   * @returns the deserialized `decoration data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inflateDecorators: (state: any) => Map<string, TreeViewDecorationData[]>;
} & Disposable;

/**
 * The default tree decorator service. Does nothing at all. One has to rebind to a concrete implementation
 * if decorators have to be supported in the tree widget.
 */
@singleton({ contrib: TreeDecoratorService })
export class NoopTreeDecoratorService implements TreeDecoratorService {
  protected readonly emitter = new Emitter<void>();
  readonly onDidChangeDecorations = this.emitter.event;

  dispose(): void {
    this.emitter.dispose();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDecorations(): Map<any, any> {
    return new Map();
  }

  deflateDecorators(): object {
    return {};
  }

  inflateDecorators(): Map<string, TreeViewDecorationData[]> {
    return new Map();
  }
}

/**
 * Abstract decorator service implementation which emits events from all known tree decorators and caches the current state.
 */
@singleton()
export abstract class AbstractTreeDecoratorService implements TreeDecoratorService {
  protected readonly onDidChangeDecorationsEmitter = new Emitter<void>();
  readonly onDidChangeDecorations = this.onDidChangeDecorationsEmitter.event;

  protected readonly toDispose = new DisposableCollection();
  protected readonly decorators: readonly TreeDecorator[];

  constructor(decorators: readonly TreeDecorator[]) {
    this.decorators = decorators;
    this.toDispose.push(this.onDidChangeDecorationsEmitter);
    this.toDispose.push(
      ...this.decorators.map((decorator) =>
        decorator.onDidChangeDecorations(() =>
          this.onDidChangeDecorationsEmitter.fire(undefined),
        ),
      ),
    );
  }

  dispose(): void {
    this.toDispose.dispose();
  }

  async getDecorations(tree: Tree): Promise<Map<string, TreeViewDecorationData[]>> {
    const changes = new Map();
    for (const decorator of this.decorators) {
      for (const [id, data] of (await decorator.decorations(tree)).entries()) {
        if (changes.has(id)) {
          changes.get(id)!.push(data);
        } else {
          changes.set(id, [data]);
        }
      }
    }
    return changes;
  }

  deflateDecorators(decorations: Map<string, TreeViewDecorationData[]>): object {
    const state = Object.create(null);
    for (const [id, data] of decorations) {
      state[id] = data;
    }
    return state;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inflateDecorators(state: any): Map<string, TreeViewDecorationData[]> {
    const decorators = new Map<string, TreeViewDecorationData[]>();
    for (const id of Object.keys(state)) {
      decorators.set(id, state[id]);
    }
    return decorators;
  }
}

export type DecoratedTreeNode = {
  /**
   * The additional tree decoration data attached to the tree node itself.
   */
  readonly decorationData: TreeViewDecorationData;
} & TreeNode;
export namespace DecoratedTreeNode {
  /**
   * Type-guard for decorated tree nodes.
   */
  export function is(node: TreeNode | undefined): node is DecoratedTreeNode {
    return !!node && 'decorationData' in node;
  }
}
