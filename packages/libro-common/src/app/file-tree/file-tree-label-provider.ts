import type { URI } from '../../common/index.js';
import { singleton, inject } from '../../ioc/index.js';

import type { DidChangeLabelEvent } from '../label/index.js';
import {
  LabelProvider,
  LabelProviderContribution,
  URIIconReference,
} from '../label/index.js';
import { TreeLabelProvider } from '../tree/tree-label-provider.js';

import { FileStatNode } from './file-tree.js';
import type { FileStat } from './files.js';

@singleton({ contrib: LabelProviderContribution })
export class FileTreeLabelProvider implements LabelProviderContribution {
  protected readonly labelProvider: LabelProvider;
  protected readonly treeLabelProvider: TreeLabelProvider;

  constructor(
    @inject(LabelProvider)
    labelProvider: LabelProvider,
    @inject(TreeLabelProvider)
    treeLabelProvider: TreeLabelProvider,
  ) {
    this.labelProvider = labelProvider;
    this.treeLabelProvider = treeLabelProvider;
  }
  protected asURIIconReference(element: FileStat): URI | URIIconReference {
    return URIIconReference.create(
      element.isDirectory ? 'folder' : 'file',
      element.resource,
    );
  }
  canHandle(element: object): number {
    return FileStatNode.is(element) ? this.treeLabelProvider.canHandle(element) + 1 : 0;
  }

  getIcon(node: FileStatNode): string {
    return this.labelProvider.getIcon(this.asURIIconReference(node.fileStat));
  }

  getName(node: FileStatNode): string {
    return this.labelProvider.getName(this.asURIIconReference(node.fileStat));
  }

  getDescription(node: FileStatNode): string {
    return this.labelProvider.getLongName(this.asURIIconReference(node.fileStat));
  }

  affects(node: FileStatNode, event: DidChangeLabelEvent): boolean {
    return event.affects(node.fileStat);
  }
}
