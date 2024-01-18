import { ExclamationCircleFilled, FolderFilled } from '@ant-design/icons';
import type { TreeNode, ViewOpenHandler } from '@difizen/mana-app';
import { FileTreeViewFactory } from '@difizen/mana-app';
import {
  FileStatNode,
  FileTree,
  FileTreeModel,
  FileTreeView,
  isOSX,
  LabelProvider,
  TreeDecoratorService,
  TreeProps,
  TreeViewDecorator,
  TreeViewModule,
  CommandRegistry,
  ManaModule,
  OpenerService,
  SelectionService,
  view,
  inject,
  singleton,
} from '@difizen/mana-app';
import { Modal } from 'antd';
import React from 'react';

import type { LibroNavigatableView } from '../navigatable-view.js';

import './index.less';

const FileTreeModule = ManaModule.create()
  .register(FileTree, FileTreeModel)
  .dependOn(TreeViewModule);

const { confirm } = Modal;

const noVerifyFileType = ['.ipynb', '.py'];

@singleton()
@view(FileTreeViewFactory, FileTreeModule)
export class FileView extends FileTreeView {
  @inject(OpenerService) protected openService: OpenerService;
  @inject(CommandRegistry) protected command: CommandRegistry;
  override id = FileTreeViewFactory;
  override className = 'libro-jupyter-file-tree';

  constructor(
    @inject(TreeProps) props: TreeProps,
    @inject(FileTreeModel) model: FileTreeModel,
    @inject(TreeViewDecorator) treeViewDecorator: TreeViewDecorator,
    @inject(SelectionService) selectionService: SelectionService,
    @inject(LabelProvider) labelProvider: LabelProvider,
    @inject(TreeDecoratorService) decoratorService: TreeDecoratorService,
  ) {
    super(
      props,
      model,
      treeViewDecorator,
      selectionService,
      labelProvider,
      decoratorService,
    );
    this.title.label = '文件导航';
    this.title.icon = <FolderFilled />;
    this.toDispose.push(this.model.onOpenNode(this.openNode));
  }

  openNode = async (treeNode: TreeNode) => {
    if (FileStatNode.is(treeNode) && !treeNode.fileStat.isDirectory) {
      if (
        (treeNode.fileStat.size || 0) / (1024 * 1024) < 10 ||
        noVerifyFileType.includes(treeNode.fileStat.resource.path.ext)
      ) {
        const opener = (await this.openService.getOpener(
          treeNode.uri,
        )) as ViewOpenHandler<LibroNavigatableView>;
        if (opener) {
          opener.open(treeNode.uri, {
            viewOptions: {
              name: treeNode.fileStat.name,
              // fileSize: treeNode.fileStat.size,
            },
          });
        }
      } else {
        confirm({
          title: '文件大小警告',
          icon: <ExclamationCircleFilled />,
          content: '您正尝试打开大于 10 MB 的文件，这可能会影响当前页面/服务的性能。',
          onOk: async () => {
            const opener = (await this.openService.getOpener(
              treeNode.uri,
            )) as ViewOpenHandler<LibroNavigatableView>;
            if (opener) {
              opener.open(treeNode.uri, {
                viewOptions: { name: treeNode.fileStat.name },
              });
            }
          },
        });
      }
    }
  };

  override handleClickEvent(
    node: TreeNode | undefined,
    event: React.MouseEvent<HTMLElement>,
  ): void {
    const modifierKeyCombined: boolean = isOSX
      ? event.shiftKey || event.metaKey
      : event.shiftKey || event.ctrlKey;
    if (!modifierKeyCombined && node) {
      if (
        FileStatNode.is(node) &&
        !node.fileStat.isDirectory &&
        !node.fileStat.isSymbolicLink
      ) {
        this.model.openNode(node);
      }
    }
    super.handleClickEvent(node, event);
  }
}
