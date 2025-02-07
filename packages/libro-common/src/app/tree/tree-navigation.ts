import { singleton } from '../../ioc/index.js';

import type { TreeNode } from './tree.js';

@singleton()
export class TreeNavigationService {
  protected index = -1;
  protected nodes: TreeNode[] = [];

  get next(): TreeNode | undefined {
    return this.nodes[this.index + 1];
  }

  get prev(): TreeNode | undefined {
    return this.nodes[this.index - 1];
  }

  advance(): TreeNode | undefined {
    const node = this.next;
    if (node) {
      this.index += 1;
      return node;
    }
    return undefined;
  }

  retreat(): TreeNode | undefined {
    const node = this.prev;
    if (node) {
      this.index -= 1;
      return node;
    }
    return undefined;
  }

  push(node: TreeNode): void {
    this.nodes = this.nodes.slice(0, this.index + 1);
    this.nodes.push(node);
    this.index += 1;
  }
}
