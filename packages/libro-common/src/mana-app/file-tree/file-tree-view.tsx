import { FileOutlined } from '@ant-design/icons';
import type { LegacyRef } from 'react';
import * as React from 'react';
import { forwardRef, lazy, Suspense } from 'react';

import { l10n } from '../../l10n/index.js'; /* eslint-disable @typescript-eslint/no-unused-vars */
import { URI } from '../../common/index.js';
import { Disposable, DisposableCollection, isCancelled } from '../../common/index.js';
import { ManaModule, SelectionService, view } from '../../mana-core/index.js';
import { ViewInstance } from '../../mana-core/index.js';
import type { MenuPath } from '../../mana-core/index.js';
import { useInject } from '../../observable/index.js';
import { singleton, inject } from '../../ioc/index.js';
import { LabelProvider } from '../label';
import { TreeModel } from '../tree';
import { CompositeTreeNode, TreeNode } from '../tree/tree';
import { TreeDecoratorService } from '../tree/tree-decorator';
import type { NodeProps } from '../tree/tree-protocol';
import { TreeProps } from '../tree/tree-protocol';
import { TreeView, TreeViewDecorator, TreeViewModule } from '../tree/view';

import { DirNode, FileStatNode, FileStatNodeData, FileTree } from './file-tree';
import { FileTreeModel } from './file-tree-model';
import { FileTreeContextMenuPath, URINode } from './file-tree-protocol';
import { FileStat, FileType } from './files';

export const FILE_TREE_CLASS = 'mana-file-tree';
export const FILE_STAT_NODE_CLASS = 'mana-FileStatNode';
export const DIR_NODE_CLASS = 'mana-DirNode';
export const FILE_STAT_ICON_CLASS = 'mana-FileStatIcon';

export const FileTreeViewFactory = 'file-tree-view-fatory';
import './style/file-icon.less';

const LazyTreeComponent = lazy(() =>
  import('./file-tree-component.js').then(({ TreeViewContent }) => ({
    default: TreeViewContent,
  })),
);

export const FileTreeViewComponent = forwardRef<HTMLDivElement>(
  function FileTreeViewComponent(
    _props: any,
    ref: LegacyRef<HTMLDivElement> | undefined,
  ) {
    const treeView = useInject<TreeView>(ViewInstance);

    return (
      <div
        ref={ref}
        onContextMenu={(event) => {
          treeView.handleContextMenuEvent(event, treeView, undefined);
        }}
        {...(treeView.createContainerAttributes() as React.HTMLAttributes<HTMLDivElement>)}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <LazyTreeComponent />
        </Suspense>
      </div>
    );
  },
);

export const FileTreeViewModule = ManaModule.create()
  .register(FileTree, FileTreeModel)
  .dependOn(TreeViewModule);
@singleton()
@view(FileTreeViewFactory, FileTreeViewModule)
export class FileTreeView extends TreeView {
  override view = FileTreeViewComponent;
  override id = FileTreeViewFactory;
  label = (<FileOutlined />);
  protected readonly toCancelNodeExpansion = new DisposableCollection();

  override readonly props: TreeProps;
  override readonly model: FileTreeModel;
  override readonly treeViewDecorator: TreeViewDecorator;
  override readonly selectionService: SelectionService;
  readonly labelProvider: LabelProvider;
  override readonly contextMenuPath: MenuPath = FileTreeContextMenuPath;
  protected override readonly decoratorService: TreeDecoratorService;

  constructor(
    @inject(TreeProps) props: TreeProps,
    @inject(TreeModel) model: FileTreeModel,
    @inject(TreeViewDecorator) treeViewDecorator: TreeViewDecorator,
    @inject(SelectionService) selectionService: SelectionService,
    @inject(LabelProvider) labelProvider: LabelProvider,
    @inject(TreeDecoratorService)
    decoratorService: TreeDecoratorService,
  ) {
    super(
      props,
      model,
      treeViewDecorator,
      selectionService,
      labelProvider,
      decoratorService,
    );
    this.props = props;
    this.model = model;
    this.treeViewDecorator = treeViewDecorator;
    this.selectionService = selectionService;
    this.labelProvider = labelProvider;
    this.decoratorService = decoratorService;
    this.className += ` ${FILE_TREE_CLASS}`;
    this.toDispose.push(this.toCancelNodeExpansion);
    this.title.icon = FileOutlined;
    this.title.label = l10n.t('文件');
  }

  override createNodeClassNames(node: TreeNode, props: NodeProps): string[] {
    const classNames = super.createNodeClassNames(node, props);
    if (FileStatNode.is(node)) {
      classNames.push(FILE_STAT_NODE_CLASS);
    }
    if (DirNode.is(node)) {
      classNames.push(DIR_NODE_CLASS);
    }
    return classNames;
  }

  override createContainerAttributes(): React.HTMLAttributes<HTMLElement> {
    const attrs = super.createContainerAttributes();
    return {
      ...attrs,
      onDragEnter: (event: any) => this.handleDragEnterEvent(this.model.root, event),
      onDragOver: (event: any) => this.handleDragOverEvent(this.model.root, event),
      onDragLeave: (event: any) => this.handleDragLeaveEvent(this.model.root, event),
      onDrop: (event: any) => this.handleDropEvent(this.model.root, event),
    };
  }

  override createNodeAttributes(
    node: TreeNode,
    props: NodeProps,
  ): React.Attributes & React.HTMLAttributes<HTMLElement> {
    const attrs = super.createNodeAttributes(node, props);
    return {
      ...attrs,
      draggable: FileStatNode.is(node),
      onDragStart: (event: any) => this.handleDragStartEvent(node, event),
      onDragEnter: (event: any) => this.handleDragEnterEvent(node, event),
      onDragOver: (event: any) => this.handleDragOverEvent(node, event),
      onDragLeave: (event: any) => this.handleDragLeaveEvent(node, event),
      onDrop: (event: any) => this.handleDropEvent(node, event),
      title: this.getNodeTooltip(node),
    };
  }

  protected getNodeTooltip(node: TreeNode): string | undefined {
    const uri = URINode.getUri(node);
    return uri ? uri.path.toString() : undefined;
  }

  protected handleDragStartEvent(node: TreeNode, event: React.DragEvent): void {
    event.stopPropagation();
    let selectedNodes;
    if (
      this.model.selectedNodes.find((selected: TreeNode | undefined) =>
        TreeNode.equals(selected, node),
      )
    ) {
      selectedNodes = [...this.model.selectedNodes];
    } else {
      selectedNodes = [node];
    }
    this.setSelectedTreeNodesAsData(event.dataTransfer, node, selectedNodes);
    if (event.dataTransfer) {
      let label: string;
      if (selectedNodes.length === 1) {
        label = this.toNodeName(node);
      } else {
        label = String(selectedNodes.length);
      }
      const dragImage = document.createElement('div');
      dragImage.className = 'mana-file-tree-drag-image';
      dragImage.textContent = label;
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, -10, -10);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  }

  protected handleDragEnterEvent(
    node: TreeNode | undefined,
    event: React.DragEvent,
  ): void {
    event.preventDefault();
    event.stopPropagation();
    this.toCancelNodeExpansion.dispose();
    const containing = DirNode.getContainingDir(node);
    if (!!containing && !containing.selected) {
      this.model.selectNode(containing);
    }
  }

  protected handleDragOverEvent(
    node: TreeNode | undefined,
    event: React.DragEvent,
  ): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.toCancelNodeExpansion.disposed) {
      return;
    }
    const timer = setTimeout(() => {
      const containing = DirNode.getContainingDir(node);
      if (!!containing && !containing.expanded) {
        this.model.expandNode(containing);
      }
    }, 500);
    this.toCancelNodeExpansion.push(Disposable.create(() => clearTimeout(timer)));
  }

  protected handleDragLeaveEvent(
    _node: TreeNode | undefined,
    event: React.DragEvent,
  ): void {
    event.preventDefault();
    event.stopPropagation();
    this.toCancelNodeExpansion.dispose();
  }

  protected async handleDropEvent(
    node: TreeNode | undefined,
    event: React.DragEvent,
  ): Promise<void> {
    try {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
      const containing = this.getDropTargetDirNode(node);
      if (containing) {
        const resources = this.getSelectedTreeNodesFromData(event.dataTransfer);
        if (resources.length > 0) {
          for (const treeNode of resources) {
            await this.model.move(treeNode, containing);
          }
        } else {
          // await this.uploadService.upload(containing.uri, { source: event.dataTransfer });
        }
      }
    } catch (e) {
      if (!isCancelled(e as any)) {
        console.error(e);
      }
    }
  }

  protected getDropTargetDirNode(node: TreeNode | undefined): DirNode | undefined {
    if (CompositeTreeNode.is(node) && node.id === 'WorkspaceNodeId') {
      if (node.children.length === 1) {
        return DirNode.getContainingDir(node.children[0]);
      }
      if (node.children.length > 1) {
        // move file to the last root folder in multi-root scenario
        return DirNode.getContainingDir(node.children[node.children.length - 1]);
      }
    }
    return DirNode.getContainingDir(node);
  }

  protected setTreeNodeAsData(data: DataTransfer, node: TreeNode): void {
    data.setData('tree-node', node.id);
  }

  protected setSelectedTreeNodesAsData(
    data: DataTransfer,
    sourceNode: TreeNode,
    relatedNodes: TreeNode[],
  ): void {
    this.setTreeNodeAsData(data, sourceNode);
    data.setData(
      'selected-tree-nodes',
      JSON.stringify(relatedNodes.map((node) => node.id)),
    );
  }

  protected getTreeNodeFromData(data: DataTransfer): TreeNode | undefined {
    const id = data.getData('tree-node');
    return this.model.getNode(id);
  }
  protected getSelectedTreeNodesFromData(data: DataTransfer): TreeNode[] {
    const resources = data.getData('selected-tree-nodes');
    if (!resources) {
      return [];
    }
    const ids: string[] = JSON.parse(resources);
    return ids
      .map((id) => this.model.getNode(id))
      .filter((node) => node !== undefined) as TreeNode[];
  }

  protected override deflateForStorage(node: TreeNode): object {
    const deflated = super.deflateForStorage(node);
    if (FileStatNode.is(node) && FileStatNodeData.is(deflated)) {
      deflated.uri = node.uri.toString();
      delete deflated.fileStat;
      deflated.stat = FileStat.toStat(node.fileStat);
    }
    return deflated;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override inflateFromStorage(node: any, parent?: TreeNode): TreeNode {
    if (FileStatNodeData.is(node)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileStatNode: FileStatNode = node as any;
      const resource = new URI(node.uri);
      fileStatNode.uri = resource;
      let stat: (typeof node)['stat'];
      // in order to support deprecated FileStat
      if (node.fileStat) {
        stat = {
          type: node.fileStat.isDirectory ? FileType.Directory : FileType.File,
          mtime: node.fileStat.mtime!,
          size: node.fileStat.size!,
        };
        delete node.fileStat;
      } else if (node.stat) {
        stat = node.stat;
        delete node.stat;
      }
      if (stat) {
        fileStatNode.fileStat = FileStat.fromStat(resource, stat);
      }
    }
    const inflated = super.inflateFromStorage(node, parent);
    if (DirNode.is(inflated)) {
      inflated.fileStat.children = [];
      for (const child of inflated.children) {
        if (FileStatNode.is(child)) {
          inflated.fileStat.children.push(child.fileStat);
        }
      }
    }
    return inflated;
  }
}
