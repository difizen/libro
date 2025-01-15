import type { TreeNode } from '@difizen/mana-app';
import { CommandRegistry, view, SelectionService } from '@difizen/mana-app';
import { URI } from '@difizen/mana-app';
import { TreeViewComponent } from '@difizen/mana-app';
import { isOSX, FileTreeModel } from '@difizen/mana-app';
import {
  FileTreeView,
  TreeProps,
  TreeViewDecorator,
  LabelProvider,
  TreeDecoratorService,
  FileStatNode,
  FileTreeViewModule,
} from '@difizen/mana-app';
import { singleton, inject } from '@difizen/mana-app';
import React, { forwardRef } from 'react';

import { FileOpenHandler } from '../file-open-handler.js';

import styles from './index.module.less';

export const FileViewFactoryId = '1-mana-file-tree';
export const FileTreeComponent = forwardRef<HTMLDivElement, any>(
  function FileTreeComponent(props, containerRef: React.ForwardedRef<HTMLDivElement>) {
    return (
      <div className={styles.fileTree} ref={containerRef}>
        <div className={styles.header}>文件</div>
        <div className={styles.content}>
          <TreeViewComponent />
        </div>
      </div>
    );
  },
);
@singleton()
@view(FileViewFactoryId, FileTreeViewModule)
export class FileView extends FileTreeView {
  override id = FileViewFactoryId;
  // view = FileTreeComponent as any;
  protected command: CommandRegistry;
  override readonly props: TreeProps;
  override readonly model: FileTreeModel;
  override readonly treeViewDecorator: TreeViewDecorator;
  override readonly selectionService: SelectionService;
  protected readonly fileOpenHandler: FileOpenHandler;
  override readonly labelProvider: LabelProvider;
  protected override readonly decoratorService: TreeDecoratorService;

  constructor(
    @inject(CommandRegistry) command: CommandRegistry,
    @inject(TreeProps) props: TreeProps,
    @inject(FileTreeModel) model: FileTreeModel,
    @inject(TreeViewDecorator) treeViewDecorator: TreeViewDecorator,
    @inject(SelectionService) selectionService: SelectionService,
    @inject(FileOpenHandler) fileOpenHandler: FileOpenHandler,
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
    this.command = command;
    this.props = props;
    this.model = model;
    this.treeViewDecorator = treeViewDecorator;
    this.selectionService = selectionService;
    this.fileOpenHandler = fileOpenHandler;
    this.labelProvider = labelProvider;
    this.decoratorService = decoratorService;

    this.toDispose.push(this.model.onOpenNode(this.openNode));
    this.className += ` ${styles.fileTree}`;
  }

  openNode = (treeNode: TreeNode) => {
    if (FileStatNode.is(treeNode) && treeNode.fileStat.isFile) {
      this.fileOpenHandler.open(new URI(treeNode.uri.toString()));
    }
  };
  override handleClickEvent(
    node: TreeNode | undefined,
    event: React.MouseEvent<HTMLElement>,
  ): void {
    const modifierKeyCombined: boolean = isOSX
      ? event.shiftKey || event.metaKey
      : event.shiftKey || event.ctrlKey;
    if (!modifierKeyCombined && node && FileStatNode.is(node) && node.fileStat.isFile) {
      this.model.openNode(node);
    }
    super.handleClickEvent(node, event);
  }
}
