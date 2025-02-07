import {
  CommandRegistry,
  FileStatNode,
  FileTreeModel,
  FileTreeView,
  FileTreeViewModule,
  inject,
  LabelProvider,
  SelectionService,
  singleton,
  TreeDecoratorService,
  TreeProps,
  TreeViewComponent,
  TreeViewDecorator,
  view,
} from '@difizen/libro-common/mana-app';
import type { TreeNode } from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/l10n';
import React, { forwardRef } from 'react';
import './index.less';

export const SettingTreeFactoryId = 'setting-editor-tree';
export const FileTreeComponent = forwardRef<HTMLDivElement, any>(
  function FileTreeComponent(props, containerRef: React.ForwardedRef<HTMLDivElement>) {
    return (
      <div className="libro-configuration-tree" ref={containerRef}>
        <div className="ai-infra-configuration-header">{l10n.t('文件')}</div>
        <div className="libro-configuration-content">
          <TreeViewComponent />
        </div>
      </div>
    );
  },
);

export const SettingTreeComponent: React.FC = () => {
  return <></>;
};

function jump(h: string) {
  const url = location.href; //Save down the URL without hash.
  location.href = '#' + h; //Go to the target element.
  history.replaceState(null, '', url); //Don't like hashes. Changing it back.
}

@singleton()
@view(SettingTreeFactoryId, FileTreeViewModule)
export class SettingTreeView extends FileTreeView {
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

    this.className += ` libro-configuration-tree`;
  }

  override handleClickEvent(
    node: TreeNode | undefined,
    event: React.MouseEvent<HTMLElement>,
  ): void {
    if (node && FileStatNode.is(node) && node.fileStat.isFile) {
      jump(node.fileStat.resource.path.base);
    }
    super.handleClickEvent(node, event);
  }
}
