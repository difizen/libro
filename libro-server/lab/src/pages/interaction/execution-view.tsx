import React, { ReactElement, useEffect, useRef } from 'react';
import {
  view,
  singleton,
  BaseView,
  ViewInstance,
  useInject,
  inject,
  prop,
  useObserve,
  URI,
  ViewRender,
  timeout,
  ViewManager,
} from '@difizen/mana-app';
import { forwardRef } from 'react';
import qs from 'query-string';
import { Button, Radio, RadioChangeEvent, Spin } from 'antd';
import { RJSFSchema, SubmitButtonProps } from '@rjsf/utils';

import './index.less';
import { LibroFileService, ServerConnection } from '@difizen/libro-jupyter';
import type { IChangeEvent } from '@rjsf/core';
import { LibroAppView } from './libro-app-view.js';

interface LibroExecution {
  id: string;
  current_index: number;
  cell_count: number;
  code_cells_executed: number;
  start_time: string;
  end_time: string;
  execute_result_path: string;
  execute_record_path: string;
}

function SubmitButton(props: SubmitButtonProps) {
  return (
    <Button type="primary" htmlType="submit">
      Submit
    </Button>
  );
}

export const LibroExecutionComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const formRef = useRef<any | null>(null);
  const instance = useInject<LibroExecutionView>(ViewInstance);
  const queryParams = qs.parse(window.location.search);
  const filePath = queryParams['path'];
  const appView = useObserve(instance.libroView);
  useEffect(() => {
    if (filePath && typeof filePath === 'string') {
      instance.path = filePath;
    }
  }, [filePath]);

  if (!queryParams['path']) {
    return <div>需要指定要执行的文件</div>;
  }
  if (!appView) {
    return null;
  }

  const handleSizeChange = (e: RadioChangeEvent) => {
    instance.mode = e.target.value;
  };
  let children: ReactElement | null = null;
  if (instance.mode === 'notebook') {
    children = appView.libroView ? (
      <ViewRender view={appView.libroView}></ViewRender>
    ) : null;
  } else {
    if (appView.executing) {
      children = (
        <Spin spinning={appView.executing} tip={`${appView.executeMessage}`}>
          <div style={{ height: 200, width: '100%' }}></div>
        </Spin>
      );
    } else {
      if (appView.succeed) {
        children = <ViewRender view={appView}></ViewRender>;
      } else {
        children = <span>{appView.executeMessage}</span>;
      }
    }
  }
  return (
    <div className="libro-execution-container" ref={ref}>
      <div className="libro-execution-container-header">
        <Radio.Group value={instance.mode} onChange={handleSizeChange}>
          <Radio.Button value="app">App</Radio.Button>
          <Radio.Button value="notebook">Notebook</Radio.Button>
        </Radio.Group>
      </div>
      <div className="libro-execution-container-content">{children}</div>
    </div>
  );
});

@singleton()
@view('libro-execution-view')
export class LibroExecutionView extends BaseView {
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(LibroFileService) fileService: LibroFileService;
  @inject(ViewManager) viewManager: ViewManager;
  override view = LibroExecutionComponent;

  @prop()
  libroView: LibroAppView | undefined;

  @prop()
  mode: string = 'app';

  protected _path: string;
  get path(): string {
    return this._path;
  }
  set path(v: string) {
    this._path = v;
    this.update();
  }

  update = async () => {
    if (!this.path) return;
    document.title = `interaction: ${this.path}`;
    this.libroView = await this.viewManager.getOrCreateView(LibroAppView, {
      resource: this.path,
    });
  };
}
