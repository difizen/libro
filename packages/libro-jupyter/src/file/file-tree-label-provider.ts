import type { DidChangeLabelEvent, FileStat, URI } from '@difizen/mana-app';
import {
  FileStatNode,
  LabelProvider,
  LabelProviderContribution,
  TreeLabelProvider,
  URIIconReference,
  inject,
  singleton,
} from '@difizen/mana-app';

@singleton({ contrib: LabelProviderContribution })
export class FileTreeLabelProvider implements LabelProviderContribution {
  @inject(LabelProvider) protected readonly labelProvider: LabelProvider;
  @inject(TreeLabelProvider) protected readonly treeLabelProvider: TreeLabelProvider;

  protected asURIIconReference(element: FileStat): URI | URIIconReference {
    return URIIconReference.create(
      element.isDirectory ? 'folder' : 'file',
      element.resource,
    );
  }
  canHandle(element: object): number {
    return FileStatNode.is(element) ? this.treeLabelProvider.canHandle(element) + 2 : 0;
  }

  getIcon(node: FileStatNode): string {
    return this.labelProvider.getIcon(this.asURIIconReference(node.fileStat));
  }

  getName(node: FileStatNode): string {
    return node.fileStat.name;
  }

  getDescription(node: FileStatNode): string {
    return this.labelProvider.getLongName(this.asURIIconReference(node.fileStat));
  }

  affects(node: FileStatNode, event: DidChangeLabelEvent): boolean {
    return event.affects(node.fileStat);
  }
}
