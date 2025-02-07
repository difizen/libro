// import { Modal } from 'antd';
import { Deferred } from '@difizen/mana-common';
import { URI } from '@difizen/mana-common';
import { inject, postConstruct, singleton } from '@difizen/mana-syringe';

import { LabelProvider } from '../label';
import {
  Tree,
  TreeExpansionService,
  TreeModel,
  TreeModelImpl,
  TreeNavigationService,
  TreeSelectionService,
} from '../tree';
import type { CompositeTreeNode, TreeNode } from '../tree';

import { FileService } from './file-service';
import { DirNode, FileNode, FileStatNode } from './file-tree';
import type { FileTree } from './file-tree';
import type { FileChange, FileChangesEvent, FileOperationEvent } from './files';
import {
  FileChangeType,
  FileOperation,
  FileOperationError,
  FileOperationResult,
} from './files';
import { FileSystemUtils } from './filesystem-utils';

@singleton({ token: TreeModel })
export class FileTreeModel extends TreeModelImpl {
  rootVisible = true;

  protected readonly labelProvider: LabelProvider;
  protected readonly fileService: FileService;
  protected override readonly tree: FileTree;
  protected override readonly selectionService: TreeSelectionService;
  protected override readonly expansionService: TreeExpansionService;
  protected override readonly navigationService: TreeNavigationService;

  constructor(
    @inject(LabelProvider) labelProvider: LabelProvider,
    @inject(FileService) fileService: FileService,
    @inject(Tree) tree: FileTree,
    @inject(TreeSelectionService) selectionService: TreeSelectionService,
    @inject(TreeExpansionService) expansionService: TreeExpansionService,
    @inject(TreeNavigationService) navigationService: TreeNavigationService,
  ) {
    super(tree, selectionService, expansionService, navigationService);
    this.labelProvider = labelProvider;
    this.fileService = fileService;
    this.tree = tree;
    this.selectionService = selectionService;
    this.expansionService = expansionService;
    this.navigationService = navigationService;
  }

  @postConstruct()
  protected override init(): void {
    super.init();
    this.toDispose.push(
      this.fileService.onDidFilesChange((changes) => this.onFilesChanged(changes)),
    );
    this.toDispose.push(
      this.fileService.onDidRunOperation((event) => this.onDidMove(event)),
    );
  }

  get selectedFileStatNodes(): Readonly<FileStatNode>[] {
    return this.selectedNodes.filter(FileStatNode.is);
  }

  *getNodesByUri(uri: URI): IterableIterator<TreeNode> {
    const node = this.getNode(uri.toString());
    if (node) {
      yield node;
    }
  }

  get location(): URI | undefined {
    const { root } = this;
    if (FileStatNode.is(root)) {
      return root.uri;
    }
    return undefined;
  }

  set location(uri: URI | undefined) {
    if (uri) {
      this.fileService
        .resolve(uri)
        .then((fileStat) => {
          if (fileStat) {
            const node = DirNode.createRoot(fileStat, this.rootVisible);
            this.navigateTo(node);
          }
          return;
        })
        .catch(() => {
          // no-op, allow failures for file dialog text input
        });
    } else {
      this.navigateTo(undefined);
    }
  }

  /**
   * to workaround https://github.com/Axosoft/nsfw/issues/42
   */
  protected onDidMove(event: FileOperationEvent): void {
    if (!event.isOperation(FileOperation.MOVE)) {
      return;
    }
    if (event.resource.parent.toString() === event.target.resource.parent.toString()) {
      // file rename
      return;
    }
    this.refreshAffectedNodes([event.resource, event.target.resource]);
  }

  protected onFilesChanged(changes: FileChangesEvent): void {
    if (
      !this.refreshAffectedNodes(this.getAffectedUris(changes)) &&
      this.isRootAffected(changes)
    ) {
      this.refresh();
    }
  }

  protected isRootAffected(changes: FileChangesEvent): boolean {
    const { root } = this;
    if (FileStatNode.is(root)) {
      return (
        changes.contains(root.uri, FileChangeType.ADDED) ||
        changes.contains(root.uri, FileChangeType.UPDATED)
      );
    }
    return false;
  }

  protected getAffectedUris(changes: FileChangesEvent): URI[] {
    return changes.changes
      .filter((change) => !this.isFileContentChanged(change))
      .map((change) => change.resource);
  }

  protected isFileContentChanged(change: FileChange): boolean {
    return (
      change.type === FileChangeType.UPDATED &&
      FileNode.is(this.getNodesByUri(change.resource).next().value)
    );
  }

  protected refreshAffectedNodes(uris: URI[]): boolean {
    const nodes = this.getAffectedNodes(uris);
    for (const node of nodes.values()) {
      this.refresh(node);
    }
    return nodes.size !== 0;
  }

  protected getAffectedNodes(uris: URI[]): Map<string, CompositeTreeNode> {
    const nodes = new Map<string, CompositeTreeNode>();
    for (const uri of uris) {
      for (const node of this.getNodesByUri(uri.parent)) {
        if (DirNode.is(node) && node.expanded) {
          nodes.set(node.id, node);
        }
      }
    }
    return nodes;
  }

  async copy(source: URI, target: Readonly<FileStatNode>): Promise<URI> {
    let targetUri = URI.resolve(target.uri, source.path.base);
    try {
      if (source.path.toString() === target.uri.path.toString()) {
        const parent = await this.fileService.resolve(source.parent);
        const name = `${source.path.name}_copy`;
        targetUri = FileSystemUtils.generateUniqueResourceURI(
          source.parent,
          parent,
          name,
          source.path.ext,
        );
      }
      await this.fileService.copy(source, targetUri);
    } catch (e) {
      console.error((e as any).message);
    }
    return targetUri;
  }

  /**
   * Move the given source file or directory to the given target directory.
   */
  async move(source: TreeNode, target: TreeNode): Promise<URI | undefined> {
    if (DirNode.is(target) && FileStatNode.is(source)) {
      const { name } = source.fileStat;
      const targetUri = URI.resolve(target.uri, name);
      try {
        await this.fileService.move(source.uri, targetUri);
        return targetUri;
      } catch (e) {
        if (
          e instanceof FileOperationError &&
          e.fileOperationResult === FileOperationResult.FILE_MOVE_CONFLICT
        ) {
          const fileName = this.labelProvider.getName(source);
          if (await this.shouldReplace(fileName)) {
            try {
              await this.fileService.move(source.uri, targetUri, { overwrite: true });
              return targetUri;
            } catch (e2) {
              console.error((e2 as any).message);
            }
          }
        } else {
          console.error((e as any).message);
        }
      }
    }
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async shouldReplace(_fileName: string): Promise<boolean> {
    const okDefer = new Deferred<boolean>();
    // Modal.confirm({
    //   title: 'Replace file',
    //   content: `File '${fileName}' already exists in the destination folder. Do you want to replace it?`,
    //   onOk: () => {
    //     okDefer.resolve(true);
    //   },
    //   onCancel: () => {
    //     okDefer.resolve(false);
    //   },
    // });
    return okDefer.promise;
  }
}
