import { MoreOutlined } from '@ant-design/icons';
import type { Disposable } from '@difizen/mana-common';
import { DisposableCollection } from '@difizen/mana-common';
import {
  CommandRegistry,
  MenuRegistry,
  ToolbarItem,
  ToolbarRegistry,
  renderNode,
} from '@difizen/mana-core';
import { l10n } from '@difizen/mana-l10n';
import { getOrigin, prop } from '@difizen/mana-observable';
import { inject, transient } from '@difizen/mana-syringe';
import classnames from 'classnames';
import Tooltip from 'rc-tooltip';

import { ToolbarItemRender } from './toolbar-item-render';
import type { ToolbarItemState } from './toolbar-protocol';

/**
 * Factory for instantiating toolbars.
 */
export const ToolbarFactory = Symbol('ToolbarFactory');
export interface ToolbarFactory {
  (): Toolbar;
}

export interface ToolbarOption {
  divider?: 'item' | 'group';
}

/**
 * The toolbar manager, a toolbar instance should be created with view.
 */
@transient()
export class Toolbar implements Disposable {
  protected toDispose = new DisposableCollection();
  protected _disposed = false;
  get disposed() {
    return this._disposed;
  }
  get onDispose() {
    return this.toDispose.onDispose;
  }

  @prop()
  currentArgs: any | any[];

  @prop()
  states: Map<string, ToolbarItemState> = new Map<string, ToolbarItemState>();

  @prop()
  tooltip?: { placement: string } | undefined;

  protected readonly commands: CommandRegistry;
  protected readonly menus: MenuRegistry;
  protected readonly toolbarRegistry: ToolbarRegistry;

  constructor(
    @inject(CommandRegistry)
    commands: CommandRegistry,

    @inject(MenuRegistry)
    menus: MenuRegistry,

    @inject(ToolbarRegistry)
    toolbarRegistry: ToolbarRegistry,
  ) {
    this.commands = commands;
    this.menus = menus;
    this.toolbarRegistry = toolbarRegistry;
    this.toolbarRegistry.items.forEach((item) => {
      this.states.set(item.id, {
        id: item.id,
        enable: false,
        visible: false,
        active: false,
      });
    });
  }

  setCurrentArgs(current: any): void {
    this.currentArgs = current;
  }

  sort(left: ToolbarItem, right: ToolbarItem) {
    const leftOrder = left.order ?? '';
    const rightOrder = right.order ?? '';
    const leftGroupOrder = ToolbarItem.getGroupKey(left);
    const rightGroupOrder = ToolbarItem.getGroupKey(right);
    const result = leftGroupOrder.localeCompare(rightGroupOrder);
    if (result !== 0) {
      return result;
    }
    return leftOrder.localeCompare(rightOrder);
  }

  get visibleItems() {
    const keys = this.states.keys();
    const items = [];
    for (const key of keys) {
      if (this.states.get(key)?.visible) {
        const item = this.toolbarRegistry.getToolbarItem(key);
        if (ToolbarItem.is(item)) {
          items.push(item);
        }
      }
    }
    return items.sort(this.sort);
  }
  isInline(item: ToolbarItem) {
    return !item.extra;
  }
  renderToolbar(inlines: ToolbarItem[], more: ToolbarItem[]) {
    return (
      <div className="mana-toolbar">
        {this.renderInlines(inlines)}
        {this.renderMore(more)}
      </div>
    );
  }
  renderMore(items: ToolbarItem[]): React.ReactNode {
    return (
      !!items.length && (
        <div key="__more__" className="mana-toolbar-item mana-toolbar-more">
          <MoreOutlined
            className="mana-toolbar-more-icon"
            title={l10n.t('更多')}
            onClick={() => {
              //
            }}
          />
        </div>
      )
    );
  }
  renderInlineDivider(key: string | undefined) {
    return <div key={key} className="mana-toolbar-inline-divider" />;
  }
  renderInlines(items: ToolbarItem[]): React.ReactNode {
    if (!items.length) {
      return null;
    }
    const nodes: React.ReactNode[] = [];
    let group: string | undefined = undefined;
    items.forEach((item) => {
      let itemGroup: string | string[] | undefined = item.group;
      const state = this.states.get(item.id);
      if (!state) {
        nodes.push(null);
        return;
      }
      if (itemGroup) {
        itemGroup = typeof itemGroup === 'string' ? itemGroup : itemGroup[0];
      }
      if (nodes.length && itemGroup !== group) {
        nodes.push(this.renderInlineDivider(itemGroup));
      }
      group = itemGroup;
      nodes.push(
        <ToolbarItemRender
          key={item.id}
          data={getOrigin(this.currentArgs)}
          toolbar={this}
          item={item}
          state={state}
        />,
      );
    });
    return nodes;
  }
  renderItem(data: any, item: ToolbarItem, state: ToolbarItemState): React.ReactNode {
    const command = this.commands.getCommand(item.command);
    const placement = this.tooltip?.placement || 'bottom';
    const tooltip = item.tooltip || command?.label;
    if (tooltip) {
      return (
        <Tooltip
          key={item.id}
          trigger="hover"
          placement={placement}
          overlay={renderNode(tooltip)}
        >
          {this.renderItemContent(data, item, state)}
        </Tooltip>
      );
    }
    return this.renderItemContent(data, item, state);
  }
  protected getItemProps(_data: any, _item: ToolbarItem, state: ToolbarItemState) {
    return {
      className: classnames('mana-toolbar-item', {
        'mana-toolbar-item-disabled': !state.enable,
        'mana-toolbar-item-active': state.active,
      }),
    };
  }
  protected renderItemContent(data: any, item: ToolbarItem, state: ToolbarItemState) {
    const command = this.commands.getCommand(item.command);
    const icon = item.icon || command?.icon;
    return (
      <div
        id={item.id}
        key={item.id}
        onClick={() => this.execute(item, getOrigin(data))}
        {...this.getItemProps(data, item, state)}
      >
        {renderNode(icon)}
        {item.label && item.showLabelInline && (
          <div className="mana-toolbar-item-label">{renderNode(item.label)}</div>
        )}
      </div>
    );
  }
  protected execute(item: ToolbarItem, data: any[]) {
    if (this.states.get(item.id)?.enable) {
      let args = data;
      if (!Array.isArray(data)) {
        args = [data];
      }
      return this.commands.executeCommandByHandler(item, item.command, ...args);
    }
    return undefined;
  }

  getState = (item: ToolbarItemState | ToolbarItem) => {
    const currentState = this.states.get(item.id);
    return currentState;
  };

  setState = (item: ToolbarItemState) => {
    this.states.set(item.id, item);
  };

  dispose(): void {
    this.states.clear();
    this.toDispose.dispose();
    this._disposed = true;
  }
}
