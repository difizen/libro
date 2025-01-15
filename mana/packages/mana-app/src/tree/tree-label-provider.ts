import { singleton } from '@difizen/mana-syringe';

import { LabelProviderContribution } from '../label/label-provider';

import { TreeNode } from './tree';

@singleton({ contrib: LabelProviderContribution })
export class TreeLabelProvider implements LabelProviderContribution {
  canHandle(element: Record<any, any>): number {
    return TreeNode.is(element) ? 50 : 0;
  }

  getIcon(node: TreeNode): string {
    return node.icon || '';
  }

  getName(node: TreeNode): string {
    return node.name || '';
  }
  getLongName(node: TreeNode): string {
    return node.description || '';
  }
}
