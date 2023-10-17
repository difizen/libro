import { LirboContextKey } from '@difizen/libro-core';
import type { KernelMessage } from '@difizen/libro-kernel';
import {
  useInject,
  view,
  ViewInstance,
  ViewOption,
  transient,
  inject,
  prop,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

import type {
  InstanceRecord,
  InstancesRecords,
  ProgressItem,
} from '../base/protocal.js';
import type { IWidgetViewProps } from '../base/protocal.js';
import { WidgetView } from '../base/widget-view.js';
import './index.less';

export interface ProgressOverviewProps {
  progressMap: Record<string, ProgressItem>;
  workingProgressKeys: string[];
  prefix: string;
  suffix: string;
}

export const LibroInstancesProgressWidgetViewComponent = forwardRef<HTMLDivElement>(
  function LibroInstancesProgressWidgetViewComponent(_props, ref) {
    const widgetView = useInject<InstancesProgressWidget>(ViewInstance);
    if (widgetView.isCommClosed) {
      return null;
    }
    return (
      <div ref={ref} className="libro-instances-progress-widget">
        <span style={{ paddingRight: 5 }}>{widgetView.prefix}</span>
        <span>
          {widgetView.workingProgressKeys.map((progressKey) => {
            const progressItem = widgetView.progressMap[progressKey];
            return (
              <a
                className="pyodps-progress-launcher"
                style={{ marginRight: 5 }}
                key={progressKey}
              >
                {progressItem && progressItem.name}
              </a>
            );
          })}
        </span>
        <span>{widgetView.suffix}</span>
      </div>
    );
  },
);
@transient()
@view('libro-widget-instances-progress-view')
export class InstancesProgressWidget extends WidgetView {
  override view = LibroInstancesProgressWidgetViewComponent;
  @prop()
  prefix: string;
  @prop()
  suffix: string;
  progressMap: Record<string, ProgressItem> = {};
  workingProgressKeys: string[] = []; // Order of groups by time of insertion
  instanceRecords: InstancesRecords = {};
  modalVisible = false;
  modalProgressItemKey = '';
  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LirboContextKey) lirboContextKey: LirboContextKey,
  ) {
    super(props, lirboContextKey);
    this.prefix = props.attributes.prefix;
    this.suffix = props.attributes.suffix;
  }
  updateRecords(progressKey: string) {
    const progressItem = this.progressMap[progressKey];
    if (progressItem) {
      const { instances = [] } = progressItem;
      instances.forEach((instance) => {
        const { id, status } = instance;
        if (!this.instanceRecords[id]) {
          this.instanceRecords[id] = {
            startDate: Date.now(),
          } as InstanceRecord;
        }
        if (status === 'Terminated') {
          if (!this.instanceRecords[id].endDate) {
            this.instanceRecords[id].endDate = Date.now();
          }
        }
      });
    }
  }
  /**
   * Handle incoming comm msg.
   */
  override handleCommMsg(msg: KernelMessage.ICommMsgMsg): Promise<void> {
    const data = msg.content.data as any;
    const method = data.method;
    switch (method) {
      case 'update':
        if (data.state.prefix) {
          this.prefix = data.state.prefix;
        }
        if (data.state.suffix) {
          this.suffix = data.state.suffix;
        }
      // eslint-disable-next-line no-fallthrough
      case 'custom':
        // eslint-disable-next-line no-case-declarations
        const customMsg = data.content;
        if (customMsg) {
          // message format: '{"action": "action", content: ["content1", "content2"]}'
          const msgObj: { action: 'update' | 'delete' | 'clear'; content: string[] } =
            JSON.parse(customMsg);
          const action: string = msgObj.action;
          const content: string[] = [];
          if (msgObj.content) {
            content.push(...msgObj.content);
          }

          switch (action) {
            case 'update':
              content.forEach((groupJson) => {
                const parsedProgressItem: ProgressItem = JSON.parse(groupJson);
                if (!this.progressMap[parsedProgressItem.key]) {
                  this.workingProgressKeys.push(parsedProgressItem.key);
                }
                this.progressMap[parsedProgressItem.key] = parsedProgressItem;
                this.updateRecords(parsedProgressItem.key);
              });
              // ? TODO: 发出一个更新 modal signal 的信号，这里需要取到之前的 key
              break;
            case 'delete':
              content.forEach((groupKey: string) => {
                if (!this.progressMap[groupKey]) {
                  return;
                }
                const i = this.workingProgressKeys.indexOf(groupKey);
                if (i >= 0) {
                  this.workingProgressKeys.splice(i, 1);
                }
              });
              break;
            case 'clear':
              this.progressMap = {};
              this.workingProgressKeys = [];
              // ? TODO: 发出更新 overview 以及 modal 的 signal
              break;
            default:
          }
        }
    }
    return Promise.resolve();
  }
}
