/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Disposable, DisposableCollection } from '@difizen/mana-common';
import { isOSX, notEmpty } from '@difizen/mana-common';
import { BaseView, SelectionService, view, ViewInstance } from '@difizen/mana-core';
import type { StatefulView, ViewSize } from '@difizen/mana-core';
import type { MenuPath } from '@difizen/mana-core';
import { getOrigin, prop, useInject } from '@difizen/mana-observable';
import { Dropdown } from '@difizen/mana-react';
import { inject, postConstruct, singleton } from '@difizen/mana-syringe';
import debounce from 'lodash.debounce';
import type PerfectScrollbar from 'perfect-scrollbar';
import { forwardRef } from 'react';
import * as React from 'react';
import type { ScrollParams } from 'react-virtualized';
import { CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';
import type { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer';
import { v1 } from 'uuid';

import { LabelProvider } from '../../label';
import { MenuRender } from '../../menu';
import {
  DEFAULT_SCROLL_OPTIONS,
  FOCUS_CLASS,
  SELECTED_CLASS,
} from '../../style/style-protocol';
import type { ModifierAwareEvent, NodeRow } from '../tree';
import { CompositeTreeNode, TreeNode, TreeNodeComponents } from '../tree';
import { TreeDecoratorService } from '../tree-decorator';
import { ExpandableTreeNode } from '../tree-expansion';
import { TopDownTreeIterator } from '../tree-iterator';
import { TreeModel } from '../tree-model';
import type { NodeProps } from '../tree-protocol';
import {
  COMPOSITE_TREE_NODE_CLASS,
  EXPANDABLE_TREE_NODE_CLASS,
  TreeProps,
  TREE_CLASS,
  TREE_CONTAINER_CLASS,
  TREE_NODE_CLASS,
} from '../tree-protocol';
import { SelectableTreeNode, TreeSelection } from '../tree-selection';
import type { TreeViewDecoration } from '../tree-view-decoration';

import { TreeViewDecorator } from './tree-view-decorator';
import { TreeViewModule } from './tree-view-module';
import './index.less';

/**
 * Representation of the tree view properties.
 */
export type ViewProps = {
  /**
   * The width property.
   */
  width: number;
  /**
   * The height property.
   */
  height: number;
  /**
   * The scroll to row value.
   */
  scrollToRow?: number;
  /**
   * The list of node rows.
   */
  rows: NodeRow[];
  handleScroll: (info: ScrollParams) => void;
  renderNodeRow: (row: NodeRow) => React.ReactNode;
};
export interface TreeViewRowProps {
  rowKey: string;
  index?: number | undefined;
  parent: MeasuredCellParent;
  style?: React.CSSProperties | undefined;
  row?: NodeRow;
  cache: CellMeasurerCache;
}
export const TreeViewRow = (props: TreeViewRowProps) => {
  const treeView = useInject<TreeView>(ViewInstance);
  const treeNodeComponents = useInject<TreeNodeComponents>(TreeNodeComponents);
  const { TreeNode: TreeNodeComponent, TreeIdent } = treeNodeComponents;
  const { row, index, parent, style, cache, ...others } = props;
  const rowKey = props.rowKey || (others as any).key || index;

  if (!row) {
    return null;
  }
  const { node, depth } = row;
  return (
    <CellMeasurer
      cache={cache}
      columnIndex={0}
      key={rowKey}
      parent={parent}
      rowIndex={index}
    >
      {({ registerChild }) => (
        <div
          onContextMenu={(event) => {
            treeView.handleContextMenuEvent(event, treeView, node);
          }}
          key={rowKey}
          style={style}
          ref={(element): void => {
            if (element && registerChild) {
              registerChild(element);
            }
          }}
        >
          <TreeIdent node={node} nodeProps={{ depth }} />
          <TreeNodeComponent node={node} nodeProps={{ depth }} />
        </div>
      )}
    </CellMeasurer>
  );
};
export function TreeViewContent() {
  const treeView = useInject<TreeView>(ViewInstance);
  const listRef = React.createRef<List>();
  const cache = React.useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
    });
  }, []);

  React.useEffect(() => {
    if (listRef && listRef.current) {
      if (treeView.isVisible) {
        cache.clearAll();
        listRef.current.recomputeRowHeights();
      } else {
        listRef.current.forceUpdateGrid();
      }
    }
  }, [treeView.scrollToRow, treeView.isVisible, listRef, cache]);

  const rows = Array.from(treeView.rows.values());
  const TreeRow = treeView.treeRowComponent;
  return (
    <Dropdown
      className="mana-tree-node-dropdown"
      trigger={['contextMenu']}
      visible={!!treeView.contextMenuData}
      onVisibleChange={(visible) => {
        if (!visible) {
          treeView.setContextMenuArgs(undefined);
        }
      }}
      overlay={
        <MenuRender
          data={treeView.contextMenuData}
          menuPath={treeView.contextMenuPath}
        />
      }
    >
      <div className="mana-tree-content">
        <List
          ref={listRef}
          width={treeView.offsetWidth || 100}
          height={treeView.offsetHeight || 100}
          rowCount={rows.length}
          rowHeight={cache.rowHeight}
          rowRenderer={(rowProps) => {
            const { key, ...treeRowProps } = rowProps;
            return (
              <TreeRow
                key={key}
                rowKey={key}
                {...treeRowProps}
                cache={cache}
                row={rows[treeRowProps.index]}
              />
            );
          }}
          scrollToIndex={treeView.scrollToRow}
          onScroll={treeView.handleScroll.bind(treeView)}
          tabIndex={-1}
          style={{
            overflowY: 'auto',
          }}
        />
      </div>
    </Dropdown>
  );
}

export const TreeViewComponent = forwardRef<HTMLDivElement>(
  function TreeViewComponent(_props, ref) {
    const treeView = useInject<TreeView>(ViewInstance);

    return (
      <div
        ref={ref}
        onContextMenu={(event) => {
          treeView.handleContextMenuEvent(event, treeView, undefined);
        }}
        {...(treeView.createContainerAttributes() as React.HTMLAttributes<HTMLDivElement>)}
      >
        <TreeViewContent />
      </div>
    );
  },
);

export const TreeViewFactoryId = 'tree-view-factory';

@singleton()
@view(TreeViewFactoryId, TreeViewModule)
export class TreeView extends BaseView implements StatefulView {
  /**
   * Row index to ensure visibility.
   * - Used to forcefully scroll if necessary.
   */
  @prop()
  scrollToRow: number | undefined;

  override id = `${TreeViewFactoryId}-${v1()}`;
  override view = TreeViewComponent;

  @prop()
  rows = new Map<string, NodeRow>();

  @prop()
  contextMenuData: any = undefined;

  scrollOptions: PerfectScrollbar.Options = DEFAULT_SCROLL_OPTIONS;
  protected override toDispose = new DisposableCollection();
  protected shouldScrollToRow = true;
  readonly contextMenuPath: MenuPath = ['tree-context-menu'];
  readonly props: TreeProps;
  readonly model: TreeModel;
  readonly treeViewDecorator: TreeViewDecorator;
  readonly selectionService: SelectionService;
  readonly lableProvider: LabelProvider;
  readonly treeRowComponent = TreeViewRow;
  protected readonly decoratorService: TreeDecoratorService;

  constructor(
    @inject(TreeProps) props: TreeProps,
    @inject(TreeModel) model: TreeModel,
    @inject(TreeViewDecorator) treeViewDecorator: TreeViewDecorator,
    @inject(SelectionService) selectionService: SelectionService,
    @inject(LabelProvider) lableProvider: LabelProvider,
    @inject(TreeDecoratorService)
    decoratorService: TreeDecoratorService,
  ) {
    super();
    this.props = props;
    this.model = model;
    this.treeViewDecorator = treeViewDecorator;
    this.selectionService = selectionService;
    this.lableProvider = lableProvider;
    this.decoratorService = decoratorService;
    this.scrollOptions = DEFAULT_SCROLL_OPTIONS;
    this.className = TREE_CLASS;
  }

  @prop()
  offsetWidth?: number | undefined = 0;

  @prop()
  offsetHeight?: number | undefined = 0;

  override onViewResize = (size: ViewSize) => {
    this.offsetHeight = size.height;
    this.offsetWidth = size.width;
  };

  @postConstruct()
  protected init(): void {
    this.toDispose.push(
      this.model,
      this.treeViewDecorator,
      this.model.onChanged(() => this.updateRows()),
      this.model.onSelectionChanged(() => this.updateScrollToRow()),
      this.decoratorService,
      this.decoratorService.onDidChangeDecorations(() =>
        this.treeViewDecorator.updateDecorations(),
      ),
      // this.labelProvider.onDidChange(e => {
      //   for (const row of this.rows.values()) {
      //     if (e.affects(row)) {
      //       this.forceUpdate();
      //       return;
      //     }
      //   }
      // }),
    );
    setTimeout(() => {
      this.updateRows();
      this.treeViewDecorator.updateDecorations();
    });
    if (this.props.globalSelection) {
      this.toDispose.push(
        this.model.onSelectionChanged(() => {
          if (
            this.container &&
            this.container.current &&
            this.container.current.contains(document.activeElement)
          ) {
            this.selectionService.selection = TreeViewSelection.create(this);
          }
        }),
        Disposable.create(() => {
          const { selection } = this.selectionService;
          if (TreeViewSelection.isSource(selection, this)) {
            this.updateGlobalSelection();
          }
        }),
      );
    }
    // this.toDispose.push(
    //   this.corePreferences.onPreferenceChanged(preference => {
    //     if (preference.preferenceName === 'workbench.tree.renderIndentGuides') {
    //       this.update();
    //     }
    //   }),
    // );
  }
  protected updateRows: () => void = debounce(() => this.doUpdateRows(), 10);
  protected doUpdateRows(): void {
    const { root } = this.model;
    const rowsToUpdate: [string, NodeRow][] = [];
    if (root) {
      const depths = new Map<CompositeTreeNode | undefined, number>();
      let index = 0;
      for (const node of new TopDownTreeIterator(root, {
        pruneCollapsed: true,
        pruneSiblings: true,
      })) {
        if (this.shouldDisplayNode(node)) {
          const parentDepth = depths.get(getOrigin(node.parent));
          const depth =
            // eslint-disable-next-line no-nested-ternary
            parentDepth === undefined
              ? 0
              : TreeNode.isVisible(node.parent)
                ? parentDepth + 1
                : parentDepth;
          if (CompositeTreeNode.is(node)) {
            depths.set(getOrigin(node), depth);
          }
          rowsToUpdate.push([
            node.id,
            {
              index: (index += 1),
              node,
              depth,
            },
          ]);
        }
      }
    }
    this.rows = new Map(rowsToUpdate);
    this.updateScrollToRow();
  }

  /**
   * Create the node class names.
   * @param node the tree node.
   * @param _props the node properties.
   *
   * @returns the list of tree node class names.
   */
  protected createNodeClassNames(node: TreeNode, _props: NodeProps): string[] {
    const classNames = [TREE_NODE_CLASS];
    if (CompositeTreeNode.is(node)) {
      classNames.push(COMPOSITE_TREE_NODE_CLASS);
    }
    if (this.isExpandable(node)) {
      classNames.push(EXPANDABLE_TREE_NODE_CLASS);
    }
    if (SelectableTreeNode.isSelected(node)) {
      classNames.push(SELECTED_CLASS);
    }
    if (SelectableTreeNode.hasFocus(node)) {
      classNames.push(FOCUS_CLASS);
    }
    return classNames;
  }
  /**
   * Create node attributes for the tree node given the node properties.
   * @param node the tree node.
   * @param props the node properties.
   */
  createNodeAttributes(
    node: TreeNode,
    props: NodeProps,
  ): React.Attributes & React.HTMLAttributes<HTMLElement> {
    const className = this.createNodeClassNames(node, props).join(' ');
    const style = this.createNodeStyle(node, props);
    return {
      className,
      style,
      onClick: (event) => this.handleClickEvent(node, event),
      onDoubleClick: (event) => this.handleDblClickEvent(node, event),
    };
  }
  /**
   * Create the container attributes for the widget.
   */
  createContainerAttributes(): React.HTMLAttributes<HTMLElement> {
    const classNames = [TREE_CONTAINER_CLASS, this.className];
    if (!this.rows.size) {
      classNames.push('empty');
    }
    return {
      className: classNames.join(' '),
    };
  }
  /**
   * Get the container tree node.
   *
   * @returns the tree node for the container if available.
   */
  getContainerTreeNode(): TreeNode | undefined {
    return this.model.root;
  }

  /**
   * Handle the context menu click event.
   * - The context menu click event is triggered by the right-click.
   * @param node the tree node if available.
   * @param event the right-click mouse event.
   */
  handleContextMenuEvent = (
    event: React.MouseEvent<HTMLElement>,
    tree: TreeView | undefined,
    n: TreeNode | TreeView | undefined,
  ): void => {
    if (TreeNode.is(n)) {
      const node = n;
      if (SelectableTreeNode.is(node)) {
        // Keep the selection for the context menu, if the widget support multi-selection and the right click happens on an already selected node.
        if (!this.props.multiSelect || !node.selected) {
          const type =
            !!this.props.multiSelect && this.hasCtrlCmdMask(event)
              ? TreeSelection.SelectionType.TOGGLE
              : TreeSelection.SelectionType.DEFAULT;
          this.model.addSelection({ node, type });
        }
        this.doFocus();
      }
      this.setContextMenuArgs(n, tree);
    } else {
      if (!this.contextMenuData) {
        this.setContextMenuArgs(undefined, tree);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };
  /**
   * Convert the tree node to context menu arguments.
   * @param _node the selectable tree node.
   */
  setContextMenuArgs = (
    node: TreeNode | undefined,
    tree?: TreeView | undefined,
  ): any => {
    const nodeOrTree = node || tree;
    const args = [getOrigin(nodeOrTree), getOrigin(tree)];
    this.contextMenuData = args.findIndex((item) => !!item) > -1 ? args : undefined;
    return this.contextMenuData;
  };
  /**
   * Actually focus the tree node.
   */
  protected doFocus(): void {
    if (!this.model.selectedNodes.length) {
      const node = this.getNodeToFocus();
      if (SelectableTreeNode.is(node)) {
        this.model.selectNode(node);
      }
    }
    // It has to be called after nodes are selected.
    if (this.props.globalSelection) {
      this.updateGlobalSelection();
    }
  }

  /**
   * Get the tree node to focus.
   *
   * @returns the node to focus if available.
   */
  protected getNodeToFocus(): SelectableTreeNode | undefined {
    const { root } = this.model;
    if (SelectableTreeNode.isVisible(root)) {
      return root;
    }
    return this.model.getNextSelectableNode(root);
  }

  updateGlobalSelection() {
    this.selectionService.selection = TreeViewSelection.create(this);
  }

  /**
   * Update the `scrollToRow`.
   * @param updateOptions the tree widget force update options.
   */
  protected updateScrollToRow(): void {
    this.scrollToRow = this.getScrollToRow();
  }

  /**
   * Handle the scroll event.
   */
  readonly handleScroll = (info: ScrollParams) => {
    if (
      this.container &&
      this.container.current &&
      this.container.current.contains(document.activeElement)
    ) {
      this.container.current.scrollTop = info.scrollTop;
    }
  };

  /**
   * Get the `scrollToRow`.
   *
   * @returns the `scrollToRow` if available.
   */
  protected getScrollToRow(): number | undefined {
    if (!this.shouldScrollToRow) {
      return undefined;
    }
    const selected = this.model.selectedNodes;
    const node: TreeNode | undefined =
      selected.find(SelectableTreeNode.hasFocus) || selected[0];
    const row = node && this.rows.get(node.id);
    return row && row.index;
  }

  protected shouldDisplayNode(node: TreeNode): boolean {
    return TreeNode.isVisible(node);
  }

  /**
   * Toggle the node.
   */
  readonly toggle = (event: React.MouseEvent<HTMLElement>) => this.doToggle(event);

  protected findNodeAttr(
    domNode: (EventTarget & HTMLElement) | null,
  ): string | undefined {
    const nodeKey = 'data-node-id';
    while (domNode) {
      if (domNode.hasAttribute(nodeKey)) {
        const attr = domNode.getAttribute(nodeKey);
        if (attr) {
          return attr;
        }
        return undefined;
      }
      domNode = domNode.parentElement;
    }
    return undefined;
  }

  /**
   * Actually toggle the tree node.
   * @param event the mouse click event.
   */
  protected doToggle(event: React.MouseEvent<HTMLElement>): void {
    const nodeId = this.findNodeAttr(event.currentTarget);
    if (nodeId) {
      const node = this.model.getNode(nodeId);
      this.handleClickEvent(node, event);
    }
    event.stopPropagation();
  }

  /**
   * Determine if the tree modifier aware event has a `ctrlcmd` mask.
   * @param event the tree modifier aware event.
   *
   * @returns `true` if the tree modifier aware event contains the `ctrlcmd` mask.
   */
  protected hasCtrlCmdMask(event: ModifierAwareEvent): boolean {
    const { metaKey, ctrlKey } = event;
    return (isOSX && metaKey) || ctrlKey;
  }

  /**
   * Determine if the tree modifier aware event has a `shift` mask.
   * @param event the tree modifier aware event.
   *
   * @returns `true` if the tree modifier aware event contains the `shift` mask.
   */
  protected hasShiftMask(event: ModifierAwareEvent): boolean {
    // Ctrl/Cmd mask overrules the Shift mask.
    if (this.hasCtrlCmdMask(event)) {
      return false;
    }
    return event.shiftKey;
  }
  /**
   * Handle the single-click mouse event.
   * @param node the tree node if available.
   * @param event the mouse single-click event.
   */
  handleClickEvent(
    maybeProxyNode: TreeNode | undefined,
    event: React.MouseEvent<HTMLElement>,
  ): void {
    const node = getOrigin(maybeProxyNode);
    if (node) {
      const shiftMask = this.hasShiftMask(event);
      const ctrlCmdMask = this.hasCtrlCmdMask(event);
      if (this.props.multiSelect) {
        if (SelectableTreeNode.is(node)) {
          if (shiftMask) {
            this.model.selectRange(node);
          } else if (ctrlCmdMask) {
            this.model.toggleNode(node);
          } else {
            this.model.selectNode(node);
          }
        }
        if (ExpandableTreeNode.is(node) && !shiftMask && !ctrlCmdMask) {
          this.model.toggleNodeExpansion(node);
        }
      } else {
        if (SelectableTreeNode.is(node)) {
          this.model.selectNode(node);
        }
        if (ExpandableTreeNode.is(node) && !ctrlCmdMask && !shiftMask) {
          this.model.toggleNodeExpansion(getOrigin(node));
        }
      }

      event.stopPropagation();
    }
  }

  /**
   * Handle the double-click mouse event.
   * @param node the tree node if available.
   * @param event the double-click mouse event.
   */
  handleDblClickEvent(
    node: TreeNode | undefined,
    event: React.MouseEvent<HTMLElement>,
  ): void {
    this.model.openNode(node);
    event.stopPropagation();
  }

  /**
   * Determine the classes to use for an icon
   * - Assumes a Font Awesome name when passed a single string, otherwise uses the passed string array
   * @param iconName the icon name or list of icon names.
   * @param additionalClasses additional CSS classes.
   *
   * @returns the icon class name.
   */
  getIconClass(iconName: string | string[], additionalClasses: string[] = []): string {
    const iconClass =
      typeof iconName === 'string'
        ? ['a', 'fa', `fa-${iconName}`]
        : ['a'].concat(iconName);
    return iconClass.concat(additionalClasses).join(' ');
  }

  /**
   * Apply font styles to the tree.
   * @param original the original css properties.
   * @param fontData the optional `fontData`.
   */
  applyFontStyles(
    original: React.CSSProperties,
    fontData: TreeViewDecoration.FontData | undefined,
  ): React.CSSProperties {
    if (fontData === undefined) {
      return original;
    }
    const modified = { ...original }; // make a copy to mutate
    const { color, style } = fontData;
    if (color) {
      modified.color = color;
    }
    if (style) {
      (Array.isArray(style) ? style : [style]).forEach((s) => {
        switch (s) {
          case 'bold':
            modified.fontWeight = s;
            break;
          case 'normal':
          case 'oblique':
          case 'italic':
            modified.fontStyle = s;
            break;
          case 'underline':
          case 'line-through':
            modified.textDecoration = s;
            break;
          default:
            throw new Error(`Unexpected font style: "${s}".`);
        }
      });
    }
    return modified;
  }

  isExpandable(node: TreeNode): node is ExpandableTreeNode {
    return ExpandableTreeNode.is(node);
  }

  needsActiveIndentGuideline(node: TreeNode): boolean {
    const { parent } = node;
    if (!parent || !this.isExpandable(parent)) {
      return false;
    }
    if (SelectableTreeNode.isSelected(parent)) {
      return true;
    }
    if (parent.expanded) {
      for (const sibling of parent.children) {
        if (
          SelectableTreeNode.isSelected(sibling) &&
          !(this.isExpandable(sibling) && sibling.expanded)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  toNodeIcon(node: TreeNode): string {
    return this.lableProvider.getIcon(node);
  }

  toNodeName(node: TreeNode): string {
    return this.lableProvider.getName(node);
  }

  toNodeDescription(node: TreeNode): string {
    return this.lableProvider.getLongName(node);
  }
  /**
   * Create the tree node style.
   * @param node the tree node.
   * @param props the node properties.
   */
  createNodeStyle(node: TreeNode, props: NodeProps): React.CSSProperties | undefined {
    return this.decorateNodeStyle(node, this.getDefaultNodeStyle(node, props));
  }

  /**
   * Decorate the node style.
   * @param node the tree node.
   * @param style the optional CSS properties.
   *
   * @returns the CSS styles if available.
   */
  protected decorateNodeStyle(
    node: TreeNode,
    style: React.CSSProperties | undefined,
  ): React.CSSProperties | undefined {
    const backgroundColor = this.treeViewDecorator
      .getDecorationData(node, 'backgroundColor')
      .filter(notEmpty)
      .shift();
    if (backgroundColor) {
      style = {
        ...(style || {}),
        backgroundColor,
      };
    }
    return style;
  }
  /**
   * Get the default node style.
   * @param node the tree node.
   * @param props the node properties.
   *
   * @returns the CSS properties if available.
   */
  protected getDefaultNodeStyle(
    node: TreeNode,
    props: NodeProps,
  ): React.CSSProperties | undefined {
    const paddingLeft = `${this.getPaddingLeft(node, props)}px`;
    return { paddingLeft };
  }

  protected getPaddingLeft(node: TreeNode, props: NodeProps): number {
    return (
      props.depth * this.props.leftPadding +
      (this.needsExpansionTogglePadding(node) ? this.props.expansionTogglePadding : 0)
    );
  }

  /**
   * If the node is a composite, a toggle will be rendered.
   * Otherwise we need to add the width and the left, right padding => 18px
   */
  protected needsExpansionTogglePadding(node: TreeNode): boolean {
    return !this.isExpandable(node);
  }

  /**
   * Deflate the tree node for storage.
   * @param node the tree node.
   */
  protected deflateForStorage(node: TreeNode): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const copy = { ...node } as any;
    if (copy.parent) {
      delete copy.parent;
    }
    if ('previousSibling' in copy) {
      delete copy.previousSibling;
    }
    if ('nextSibling' in copy) {
      delete copy.nextSibling;
    }
    if ('busy' in copy) {
      delete copy.busy;
    }
    if (CompositeTreeNode.is(node)) {
      copy.children = [];
      for (const child of node.children) {
        copy.children.push(this.deflateForStorage(child));
      }
    }
    return copy;
  }

  /**
   * Inflate the tree node from storage.
   * @param node the tree node.
   * @param parent the optional tree node.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected inflateFromStorage(node: any, parent?: TreeNode): TreeNode {
    if (node.selected) {
      node.selected = false;
    }
    if (parent) {
      node.parent = parent;
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children as TreeNode[]) {
        this.inflateFromStorage(child, node);
      }
    }
    return node;
  }

  /**
   * Store the tree state.
   */
  storeState(): object {
    const decorations = this.decoratorService.deflateDecorators(
      this.treeViewDecorator.decorations,
    );
    let state: object = {
      decorations,
    };
    if (this.model.root) {
      state = {
        ...state,
        root: this.deflateForStorage(this.model.root),
        model: this.model.storeState(),
      };
    }

    return state;
  }

  /**
   * Restore the state.
   * @param oldState the old state object.
   */
  restoreState(oldState: object): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { root, decorations, model } = oldState as any;
    if (root) {
      this.model.root = this.inflateFromStorage(root);
    }
    if (decorations) {
      this.treeViewDecorator.decorations =
        this.decoratorService.inflateDecorators(decorations);
    }
    if (model) {
      this.model.restoreState(model);
    }
  }
}

export type TreeViewSelection = readonly Readonly<SelectableTreeNode>[] & {
  source: TreeView;
};
export namespace TreeViewSelection {
  export function isSource(
    selection: Record<any, any> | undefined,
    source: TreeView,
  ): boolean {
    return getSource(selection) === source;
  }
  export function getSource(
    selection: Record<any, any> | undefined,
  ): TreeView | undefined {
    return is(selection) ? selection.source : undefined;
  }
  export function is(
    selection: Record<any, any> | undefined,
  ): selection is TreeViewSelection {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (
      Array.isArray(selection) &&
      'source' in selection &&
      (selection as any).source instanceof TreeView
    );
  }
  export function create(source: TreeView): TreeViewSelection {
    return Object.assign(source.model.selectedNodes, { source });
  }
}
