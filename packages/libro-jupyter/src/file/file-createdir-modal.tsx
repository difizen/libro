import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { URI } from '@difizen/mana-app';
import { ViewManager } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Form, message, Input, Modal } from 'antd';
import type { InputRef } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { JupyterFileService } from './file-service.js';
import { FileView } from './file-view/index.js';
import './index.less';

export interface ModalItemType {
  path: string;
}

export const FileCreateDirModalComponent: React.FC<ModalItemProps<ModalItemType>> = ({
  visible,
  close,
  data,
}: ModalItemProps<ModalItemType>) => {
  const fileService = useInject(JupyterFileService);
  const viewManager = useInject(ViewManager);
  const inputRef = useRef<InputRef>(null);
  const [fileView, setFileView] = useState<FileView>();
  const [form] = Form.useForm();

  const onFinish = async (values: { dirName: string }) => {
    await form.validateFields();
    close();
    try {
      await fileService.newFileDir(values.dirName, new URI(data.path));
      if (fileView) {
        fileView.model.refresh();
      }
    } catch {
      message.error('新建文件夹失败');
    }
  };

  const validateDirName = async (rule: any, value: string, callback: any) => {
    if (!value || !value.length) {
      throw new Error('请输入文件夹名');
    } else {
      const targetURI = new URI(data.path + value);
      const fileRes = await fileService.resolve(targetURI);
      if (fileRes.isDirectory) {
        throw new Error('文件夹名称已存在，请重新输入');
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
      title="新建文件夹"
      open={visible}
      onCancel={close}
      cancelText="取消"
      okText="确定"
      onOk={() => {
        form.submit();
      }}
      keyboard={true}
      wrapClassName="libro-create-dir-modal"
      width={524}
    >
      <div className="libro-create-file-des">创建位置：</div>
      <span className="libro-create-file-path">{data.path}</span>
      <Form
        layout="vertical"
        autoComplete="off"
        form={form}
        onFinish={onFinish}
        className="libro-create-dir-file-form"
      >
        <Form.Item
          name="dirName"
          label="文件夹名称"
          rules={[{ required: true, validator: validateDirName }]}
        >
          <Input
            ref={inputRef}
            onKeyDown={async (e) => {
              if (e.keyCode === 13) {
                form.submit();
              }
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const FileDirCreateModal: ModalItem<ModalItemType> = {
  id: 'file.createdir.modal',
  component: FileCreateDirModalComponent,
};
