import { ThemeService, useInject, ViewManager } from '@difizen/libro-common/app';
import type { ModalItem, ModalItemProps, URI } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';
import { Form, message, Input, Modal, theme, ConfigProvider } from 'antd';
import type { InputRef } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { JupyterFileService } from './file-service.js';
import { FileView } from './file-view/index.js';
import './index.less';

export interface ModalItemType {
  resource: URI;
  fileName: string;
}

export const FileRenameModalComponent: React.FC<ModalItemProps<ModalItemType>> = ({
  visible,
  close,
  data,
}: ModalItemProps<ModalItemType>) => {
  const fileService = useInject(JupyterFileService);
  const viewManager = useInject(ViewManager);
  const inputRef = useRef<InputRef>(null);
  const [form] = Form.useForm();
  const [fileView, setFileView] = useState<FileView>();
  const themeService = useInject(ThemeService);
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

  const onFinish = async (values: { rename: string }) => {
    await form.validateFields();
    close();
    try {
      if (data && data.resource) {
        await fileService.rename(data.resource, values.rename);
        if (fileView) {
          fileView.model.refresh();
        }
      }
    } catch {
      message.error(l10n.t('重命名文件/文件夹失败'));
    }
  };

  const validateRename = async (rule: any, value: string, callback: any) => {
    if (!value || !value.length) {
      throw new Error(l10n.t('请输入文件夹名'));
    } else {
      if (value === data?.fileName) {
        throw new Error(l10n.t('文件/文件夹名称已存在，请重新输入'));
      }
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeService.getCurrentTheme().type === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <Modal
        title={l10n.t('文件重命名')}
        open={visible}
        onCancel={close}
        onOk={() => {
          form.submit();
        }}
        wrapClassName="libro-rename-file-modal"
      >
        <Form
          layout="vertical"
          autoComplete="off"
          form={form}
          onFinish={onFinish}
          className="libro-rename-file-form"
        >
          <Form.Item
            name="rename"
            label={l10n.t('文件/文件夹名称')}
            rules={[{ required: true, validator: validateRename }]}
            initialValue={data?.fileName}
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
    </ConfigProvider>
  );
};

export const FileRenameModal: ModalItem<ModalItemType> = {
  id: 'file.rename.modal',
  component: FileRenameModalComponent,
};
