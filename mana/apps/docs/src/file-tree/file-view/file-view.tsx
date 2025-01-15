import type { TreeNode } from '@difizen/mana-app';
import { FileTreeViewFactory } from '@difizen/mana-app';
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
import { CommandRegistry, view, SelectionService } from '@difizen/mana-app';
import { singleton, inject } from '@difizen/mana-app';

import './index.less';

@singleton()
@view(FileTreeViewFactory, FileTreeViewModule)
export class FileView extends FileTreeView {
  override id = FileTreeViewFactory;
  protected command: CommandRegistry;
  override readonly props: TreeProps;
  override readonly model: FileTreeModel;
  override readonly treeViewDecorator: TreeViewDecorator;
  override readonly selectionService: SelectionService;
  override readonly labelProvider: LabelProvider;
  protected override readonly decoratorService: TreeDecoratorService;

  constructor(
    @inject(CommandRegistry) command: CommandRegistry,
    @inject(TreeProps) props: TreeProps,
    @inject(FileTreeModel) model: FileTreeModel,
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
    this.command = command;
    this.props = props;
    this.model = model;
    this.treeViewDecorator = treeViewDecorator;
    this.selectionService = selectionService;
    this.labelProvider = labelProvider;
    this.decoratorService = decoratorService;

    this.toDispose.push(this.model.onOpenNode(this.openNode));
    this.className += ` mana-example-file-tree`;
  }

  openNode = (treeNode: TreeNode) => {
    if (FileStatNode.is(treeNode) && treeNode.fileStat.isFile) {
      console.info('openNode', treeNode);
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
