import type { ConfigurationNode } from '@difizen/mana-app';
import {
  BaseView,
  ConfigurationRenderRegistry,
  prop,
  SchemaValidator,
  transient,
  useConfigurationValue,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { Form } from 'antd';
import React from 'react';

import './index.less';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConfigurationNodeRender: React.FC<{ node: ConfigurationNode<any> }> = ({
  node,
}) => {
  const configurationRenderRegistry = useInject(ConfigurationRenderRegistry);
  const schemaValidator = useInject(SchemaValidator);
  const Render = configurationRenderRegistry.getConfigurationRender(node);
  const [value, setValue] = useConfigurationValue(node);
  return (
    <div key={node.id}>
      {Render && (
        <div id={node.id}>
          <Form.Item
            label={node.title}
            extra={node.description}
            rules={[
              {
                validator: (_, currentVal) => {
                  const valid = schemaValidator.validateNode(node, currentVal);
                  if (valid) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('invalid value'));
                },
              },
            ]}
            hasFeedback
          >
            <Render
              label={node.title}
              value={value}
              schema={node.schema}
              onChange={(val) => {
                setValue(val);
              }}
            />
          </Form.Item>
        </div>
      )}
    </div>
  );
};

export const DefaultConfigurationViewComponent: React.FC = () => {
  const [form] = Form.useForm();
  const viewInstance = useInject<ConfigurationPanelView>(ViewInstance);
  const configs = viewInstance.configurationNodes;
  return (
    <Form
      {...layout}
      form={form}
      className={`mana-configuration-panel-container ${viewInstance.className}`}
    >
      {configs?.map((config) => {
        return <ConfigurationNodeRender node={config} key={config.id} />;
      })}
    </Form>
  );
};

@transient()
@view('ConfigurationPanel')
export class ConfigurationPanelView extends BaseView {
  override view = DefaultConfigurationViewComponent;

  @prop() // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurationNodes: ConfigurationNode<any>[] = [];
}
