import { useEffect, useRef } from 'react';
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
import { Button, Spin } from 'antd';
import { Form } from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import { RJSFSchema, SubmitButtonProps } from '@rjsf/utils';
import { BoxPanel } from '@difizen/mana-react';

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

  useEffect(() => {
    if (appView?.libroView?.model.metadata) {
      const metadata = appView.libroView?.model.metadata;
      if (metadata && metadata['args']) {
        instance.schema = metadata['args'];
        return;
      }
    }
  }, [appView?.libroView?.model.isInitialized]);

  const onSub = (data: IChangeEvent<any, RJSFSchema, any>) => {
    const formData = data.formData;
    instance.execute(formData);
  };

  if (!queryParams['path']) {
    return <div>需要指定要执行的文件</div>;
  }
  return (
    <div className="libro-execution-container" ref={ref}>
      <BoxPanel className="libro-execution-container-wrapper" direction="left-to-right">
        <BoxPanel.Pane className="libro-execution-container-left">
          {instance.executing && (
            <Spin
              spinning={instance.executing}
              tip={`${instance.currentIndex}/${instance.count}`}
            >
              <div style={{ height: 200, width: '100%' }}></div>
            </Spin>
          )}
          {!instance.executing && instance.resultView && (
            <ViewRender view={instance.resultView}></ViewRender>
          )}
        </BoxPanel.Pane>
        <BoxPanel.Pane className="libro-execution-container-right" flex={1}>
          <div>
            {instance.schema && (
              <Form
                ref={formRef}
                schema={instance.schema}
                validator={validator as any}
                onSubmit={onSub}
                templates={{ ButtonTemplates: { SubmitButton } }}
              />
            )}
          </div>
        </BoxPanel.Pane>
      </BoxPanel>
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
  schema: any;

  @prop()
  resultView: LibroAppView | undefined;

  @prop()
  executionId: string;

  @prop()
  executing: boolean = false;

  @prop()
  count: number = 0;

  @prop()
  currentIndex: number = 0;

  protected _path: string;
  get path(): string {
    return this._path;
  }
  set path(v: string) {
    this._path = v;
    this.update();
  }

  update = async () => {
    this.schema = undefined;
    if (!this.path) return;
    document.title = `execution: ${this.path}`;
    this.libroView = await this.viewManager.getOrCreateView(LibroAppView, {
      resource: this.path,
    });
    this.updateExecutionResult();
  };

  updateExecutionResult = async () => {
    try {
      const file = new URI(this.path);
      const baseName = file.path.base;
      const resultUri = URI.resolve(file, `../execution/${baseName}`);
      const resultPath = resultUri.path.toString();
      const tryRead = await this.fileService.read(resultPath);
      if (tryRead) {
        this.resultView = await this.viewManager.getOrCreateView(LibroAppView, {
          resource: resultPath,
        });
      }
    } catch (e) {}
  };

  execute = async (args: any) => {
    this.serverConnection.settings.baseUrl;
    try {
      const res = await this.serverConnection.makeRequest(
        `${this.serverConnection.settings.baseUrl}libro/api/execution`,
        {
          method: 'POST',
          body: JSON.stringify({ args, file: this.path }),
        },
      );
      const result = await res.json();
      this.executionId = result.id;
      this.executing = true;
      if (this.libroView) {
        this.libroView.dispose();
      }
      this.libroView = undefined;
      this.updateStatus();
    } catch (ex) {
      console.log(ex);
    }
  };

  doUpdateStatus = async () => {
    const res = await this.serverConnection.makeRequest(
      `${this.serverConnection.settings.baseUrl}libro/api/execution?id=${this.executionId}`,
      {
        method: 'GET',
      },
    );
    const result = (await res.json()) as LibroExecution;
    this.count = result.cell_count;
    this.currentIndex = result.current_index;
    if (result.end_time) {
      this.executing = false;
      return true;
    }
    return false;
  };

  updateStatus = async (): Promise<void> => {
    if (!(await this.doUpdateStatus())) {
      await timeout(1000);
      return this.updateStatus();
    } else {
      this.updateExecutionResult();
    }
  };
}
