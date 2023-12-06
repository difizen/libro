import type { ModalItemProps, ModalItem } from '@difizen/mana-app';
import { URI, useInject, ViewManager } from '@difizen/mana-app';
import { Col, Form, message, Row, Input, Modal } from 'antd';
import type { InputRef } from 'antd';
import { useEffect, useRef, useState } from 'react';
import './index.less';

import {
  FileView,
  JSONIcon,
  JupyterFileService,
  MoreIcon,
  NotebookIcon,
  PythonIcon,
} from './index.js';

export interface ModalItemType {
  path: string;
}

type FileType = '.ipynb' | '.py' | '.json' | '.sql' | undefined;

export const FileCreateModalComponent: React.FC<ModalItemProps<ModalItemType>> = ({
  visible,
  close,
  data,
}: ModalItemProps<ModalItemType>) => {
  const fileService = useInject(JupyterFileService);
  const viewManager = useInject(ViewManager);
  const [fileType, setFileType] = useState<FileType>(undefined);
  const [fileView, setFileView] = useState<FileView>();
  const inputRef = useRef<InputRef>(null);
  const [form] = Form.useForm();

  const onFinish = async (values: { fileName: string }) => {
    await form.validateFields();
    close();
    try {
      await fileService.newFile(values.fileName + fileType || '', new URI(data.path));
      if (fileView) {
        fileView.model.refresh();
      }
    } catch {
      message.error('新建文件失败');
    }
  };

  const validateFileName = async (rule: any, value: string, callback: any) => {
    if (!value || !value.length) {
      throw new Error('请输入文件名');
    } else {
      const targetURI = new URI(data.path + value + (fileType || ''));
      const fileRes = await fileService.resolve(targetURI);
      if (fileRes.isFile) {
        throw new Error('文件名称已存在，请重新输入');
      }
    }
  };

  useEffect(() => {
    viewManager
      .getOrCreateView(FileView)
      .then((view) => {
        setFileView(view);
        return;
      })
      .catch(() => {
        //
      });
    inputRef.current?.focus();
  });
  return (
    <Modal
      title="新建文件"
      open={visible}
      onCancel={close}
      width={788}
      cancelText="取消"
      okText="确定"
      onOk={() => {
        form.submit();
      }}
      keyboard={true}
      wrapClassName="libro-create-file-modal"
    >
      <div className="libro-create-file-path-container">
        <div className="libro-create-file-des">创建位置：</div>
        <span className="libro-create-file-path">{data.path}</span>
      </div>
      <div className="libro-create-file-des">文件类型：</div>
      <Row>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '16px' }}
        >
          <div
            className={`libro-create-file-type ${
              fileType === '.ipynb' ? 'active' : ''
            }`}
            onClick={() => {
              setFileType('.ipynb');
            }}
          >
            <NotebookIcon />
            <span className="libro-create-file-type-text">Notebook</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '16px' }}
        >
          <div
            className={`libro-create-file-type ${fileType === '.py' ? 'active' : ''}`}
            onClick={() => {
              setFileType('.py');
            }}
          >
            <PythonIcon />
            <span className="libro-create-file-type-text">Python</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '16px' }}
        >
          <div
            className={`libro-create-file-type ${fileType === '.json' ? 'active' : ''}`}
            onClick={() => {
              setFileType('.json');
            }}
          >
            <JSONIcon />
            <span className="libro-create-file-type-text">JSON</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '16px' }}
        >
          <div
            className={`libro-create-file-type ${
              fileType === undefined ? 'active' : ''
            }`}
            onClick={() => {
              setFileType(undefined);
            }}
          >
            <MoreIcon />
            <span className="libro-create-file-type-text">其他</span>
          </div>
        </Col>
      </Row>
      <Form
        layout="vertical"
        autoComplete="off"
        form={form}
        onFinish={onFinish}
        className="libro-create-file-form"
      >
        <Form.Item
          name="fileName"
          label="文件名称"
          rules={[{ required: true, validator: validateFileName }]}
        >
          <Input addonAfter={fileType || ''} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const FileCreateModal: ModalItem<ModalItemType> = {
  id: 'file.create.modal',
  component: FileCreateModalComponent,
};
