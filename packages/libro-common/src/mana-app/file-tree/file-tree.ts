/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import type { URI } from '@difizen/mana-common';
import { getOrigin } from '@difizen/mana-observable';
import { inject, singleton } from '@difizen/mana-syringe';

import type { TreeNode, CompositeTreeNode } from '../tree/tree';
import { Tree } from '../tree/tree';
import type { ExpandableTreeNode } from '../tree/tree-expansion';
import { TreeImpl } from '../tree/tree-impl';
import type { SelectableTreeNode } from '../tree/tree-selection';

import type { FileSelection } from './file-selection';
import { FileService } from './file-service';
import type { URINode } from './file-tree-protocol';
import type { FileStat, FileType, Stat } from './files';
import { FileOperationError, FileOperationResult } from './files';

@singleton({ token: Tree })
export class FileTree extends TreeImpl {
  protected readonly fileService: FileService;

  constructor(
    @inject(FileService)
    fileService: FileService,
  ) {
    super();
    this.fileService = fileService;
  }

  override async resolveChildren(raw: CompositeTreeNode): Promise<TreeNode[]> {
    const parent = getOrigin(raw);
    if (FileStatNode.is(parent)) {
      const fileStat = await this.resolveFileStat(parent);
      if (fileStat) {
        return this.toNodes(fileStat, parent);
      }
      return [];
    }
    return super.resolveChildren(parent);
  }

  protected async resolveFileStat(node: FileStatNode): Promise<FileStat | undefined> {
    try {
      const fileStat = await this.fileService.resolve(node.uri);
      node.fileStat = fileStat;
      return fileStat;
    } catch (e) {
      if (
        !(
          e instanceof FileOperationError &&
          e.fileOperationResult === FileOperationResult.FILE_NOT_FOUND
        )
      ) {
        console.error((e as any).message);
      }
      return undefined;
    }
  }

  protected async toNodes(
    fileStat: FileStat,
    parent: CompositeTreeNode,
  ): Promise<TreeNode[]> {
    if (!fileStat.children) {
      return [];
    }
    const result = await Promise.all(
      fileStat.children.map(async (child) => this.toNode(child, parent)),
    );
    return result.sort(DirNode.compare);
  }

  protected toNode(fileStat: FileStat, parent: CompositeTreeNode): FileNode | DirNode {
    const uri = fileStat.resource;
    const id = this.toNodeId(uri, parent);
    const node = this.getNode(id);
    if (fileStat.isDirectory) {
      if (DirNode.is(node)) {
        node.fileStat = fileStat;
        return node;
      }
      return <DirNode>{
        id,
        uri,
        fileStat,
        parent,
        expanded: false,
        selected: false,
        children: [],
      };
    }
    if (FileNode.is(node)) {
      node.fileStat = fileStat;
      return node;
    }
    return <FileNode>{
      id,
      uri,
      fileStat,
      parent,
      selected: false,
    };
  }

  protected toNodeId(uri: URI, _parent: CompositeTreeNode): string {
    return uri.path.toString();
  }
}

export interface FileStatNode extends SelectableTreeNode, URINode, FileSelection {}
export namespace FileStatNode {
  export function is(node: object | undefined): node is FileStatNode {
    return !!node && 'fileStat' in node;
  }

  export function getUri(node: TreeNode | undefined): string | undefined {
    if (is(node)) {
      return node.fileStat.resource.toString();
    }
    return undefined;
  }
}

export type FileStatNodeData = Omit<FileStatNode, 'uri' | 'fileStat'> & {
  uri: string;
  stat?: Stat | ({ type: FileType } & Partial<Stat>);
  fileStat?: FileStat;
};
export namespace FileStatNodeData {
  export function is(node: object | undefined): node is FileStatNodeData {
    return !!node && 'uri' in node && ('fileStat' in node || 'stat' in node);
  }
}

export type FileNode = FileStatNode;
export namespace FileNode {
  export function is(node: Record<any, any> | undefined): node is FileNode {
    return FileStatNode.is(node) && !node.fileStat.isDirectory;
  }
}

export type DirNode = FileStatNode & ExpandableTreeNode;
export namespace DirNode {
  export function is(node: Record<any, any> | undefined): node is DirNode {
    return FileStatNode.is(node) && node.fileStat.isDirectory;
  }

  export function compare(node: TreeNode, node2: TreeNode): number {
    return DirNode.dirCompare(node, node2) || uriCompare(node, node2);
  }

  export function uriCompare(node: TreeNode, node2: TreeNode): number {
    if (FileStatNode.is(node)) {
      if (FileStatNode.is(node2)) {
        return node.uri.displayName.localeCompare(node2.uri.displayName);
      }
      return 1;
    }
    if (FileStatNode.is(node2)) {
      return -1;
    }
    return 0;
  }

  export function dirCompare(node: TreeNode, node2: TreeNode): number {
    const a = DirNode.is(node) ? 1 : 0;
    const b = DirNode.is(node2) ? 1 : 0;
    return b - a;
  }

  export function createRoot(fileStat: FileStat, rootVisible: boolean): DirNode {
    const uri = fileStat.resource;
    const id = uri.toString();
    return {
      id,
      uri,
      fileStat,
      visible: rootVisible,
      parent: undefined,
      children: [],
      expanded: true,
      selected: false,
    };
  }

  export function getContainingDir(node: TreeNode | undefined): DirNode | undefined {
    let containing = node;
    while (!!containing && !is(containing)) {
      containing = containing.parent;
    }
    return containing;
  }
}
