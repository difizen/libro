import React, { useRef } from 'react';
import {
  view,
  transient,
  useInject,
  ViewInstance,
  prop,
  inject,
  ViewOption,
} from '@difizen/mana-app';

import type { IWidgetViewProps } from '@difizen/libro-jupyter';
import { WidgetView } from '@difizen/libro-jupyter';
import { forwardRef, useCallback, useMemo } from 'react';
import { LibroContextKey } from '@difizen/libro-core';
import { RJSFSchema, SubmitButtonProps } from '@rjsf/utils';
import Form from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import type { KernelMessage } from '@difizen/libro-kernel';
import './index.less';

function SubmitButton(props: SubmitButtonProps) {
  return null;
}

export const LibroSchemaFormWidgetComponent = forwardRef<HTMLDivElement>(
  (props, ref) => {
    const widgetView = useInject<LibroSchemaFormtWidget>(ViewInstance);
    const formRef = useRef<Form<any, RJSFSchema, any> | null>(null);
    const schema = useMemo(() => {
      try {
        return JSON.parse(widgetView.schema) as RJSFSchema;
      } catch (e) {
        return {};
      }
    }, [widgetView.schema]);

    const value = useMemo(() => {
      try {
        const v = JSON.parse(widgetView.value);
        if (formRef.current) {
          formRef.current.setState(v);
        }
        return v;
      } catch (e) {
        // console.error(e);
        return {};
      }
    }, [widgetView.value]);

    const handleChange = useCallback(
      (values: any) => {
        const data = {
          buffer_paths: [],
          method: 'update',
          state: { value: JSON.stringify(values.formData) },
        };
        widgetView.send(data);
      },
      [widgetView],
    );

    if (widgetView.isCommClosed) {
      return null;
    }

    return (
      <div className="libro-widget-schema-form" ref={ref}>
        <Form
          ref={formRef}
          schema={schema}
          validator={validator}
          onChange={handleChange}
          templates={{ ButtonTemplates: { SubmitButton } }}
        />
      </div>
    );
  },
);

@transient()
@view('libro-widget-schema-form-view')
export class LibroSchemaFormtWidget extends WidgetView {
  override view = LibroSchemaFormWidgetComponent;

  schema: string;

  @prop() value: string;

  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LibroContextKey) libroContextKey: LibroContextKey,
  ) {
    super(props, libroContextKey);
    this.schema = props.attributes.schema;
    this.value = props.attributes.value;
  }

  override handleCommMsg(msg: KernelMessage.ICommMsgMsg): Promise<void> {
    const data = msg.content.data as any;
    const method = data.method;
    switch (method) {
      case 'update':
      case 'echo_update':
        if (data.state.value) {
          this.value = data.state.value;
        }
        if (data.state.schema) {
          this.schema = data.state.schema;
        }
    }
    return Promise.resolve();
  }
}
