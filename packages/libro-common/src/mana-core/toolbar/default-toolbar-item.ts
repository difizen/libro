import type { Event } from '@difizen/mana-common';
import { Emitter } from '@difizen/mana-common';
import { prop } from '@difizen/mana-observable';
import { inject } from '@difizen/mana-syringe';
import { transient } from '@difizen/mana-syringe';

import { ToolbarNode } from './toolbar-protocol';
import type { ToolbarItem } from './toolbar-protocol';

@transient()
export class DefaultToolbarItem implements ToolbarItem {
  readonly id: string;
  readonly command: string;

  source: ToolbarNode;

  meta?: Record<string, any> | undefined;

  @prop()
  readonly extra?: boolean | undefined;

  @prop()
  readonly showLabelInline?: boolean | undefined;

  @prop()
  readonly order?: string | undefined;

  @prop()
  readonly group?: string | string[] | undefined;

  protected disposedEventEmitter: Emitter<void> = new Emitter();

  onDisposed: Event<void> = this.disposedEventEmitter.event;

  /**
   * Optional label for the item.
   */
  readonly label?: React.ReactNode | React.FC;

  /**
   * Optional tooltip for the item.
   */
  readonly tooltip?: React.ReactNode | React.FC;

  /**
   * Optional icon for the item.
   */
  readonly icon?: React.ReactNode | React.FC;

  readonly execute?: ((...args: any[]) => any) | undefined;
  readonly isEnabled?: ((...args: any[]) => boolean) | undefined;
  readonly isVisible?: ((...args: any[]) => boolean) | undefined;
  readonly isActive?: ((...args: any[]) => boolean) | undefined;

  item: ToolbarNode;

  constructor(@inject(ToolbarNode) item: ToolbarNode) {
    this.item = item;
    this.source = item;
    this.id = item.id;
    this.command = item.command;
    this.extra = item.extra;
    this.order = item.order;
    this.label = item.label;
    this.tooltip = item.tooltip;
    this.icon = item.icon;
    this.meta = item.meta;
    this.group = item.group;
    this.showLabelInline = item.showLabelInline;
    this.isActive = item.isActive;
    this.isEnabled = item.isEnabled;
    this.isVisible = item.isVisible;
    this.execute = item.execute;
  }
  disposed?: boolean | undefined;

  dispose() {
    this.disposedEventEmitter.fire();
  }
}
