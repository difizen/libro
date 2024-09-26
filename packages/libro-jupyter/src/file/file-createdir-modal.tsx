import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { ThemeService } from '@difizen/mana-app';
import { URI } from '@difizen/mana-app';
import { ViewManager } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Form, message, Input, Modal, ConfigProvider, theme } from 'antd';
import type { InputRef } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { JupyterFileService } from './file-service.js';
import { FileView } from './file-view/index.js';
import './index.less';

export interface FileDirCreateModalItemType {
  path: string;
}

export const FileCreateDirModalComponent: React.FC<
  ModalItemProps<FileDirCreateModalItemType>
> = ({ visible, close, data }: ModalItemProps<FileDirCreateModalItemType>) => {
  const fileService = useInject(JupyterFileService);
  const viewManager = useInject(ViewManager);
  const themeService = useInject(ThemeService);
  const inputRef = useRef<InputRef>(null);
  const [fileView, setFileView] = useState<FileView>();
  const [form] = Form.useForm();

  const onFinish = async (values: { dirName: string }) => {
    await form.validateFields();
    close();
    try {
      await fileService.newFileDir(values.dirName, new URI(data?.path));
      if (fileView) {
        fileView.model.refresh();
      }
    } catch {
      message.error(l10n.t('新建文件夹失败'));
    }
  };

  const validateDirName = async (rule: any, value: string, callback: any) => {
    if (!value || !value.length) {
      throw new Error(l10n.t('请输入文件夹名'));
    } else {
      const targetURI = new URI(data?.path + value);
      const fileRes = await fileService.resolve(targetURI);
      if (fileRes.isDirectory) {
        throw new Error(l10n.t('文件夹名称已存在，请重新输入'));
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
    <ConfigProvider
      theme={{
        algorithm:
          themeService.getCurrentTheme().type === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <Modal
        title={l10n.t('新建文件夹')}
        open={visible}
        onCancel={close}
        cancelText={l10n.t('取消')}
        okText={l10n.t('确定')}
        onOk={() => {
          form.submit();
        }}
        keyboard={true}
        wrapClassName="libro-create-dir-modal"
        width={524}
      >
        <div className="libro-create-file-des">{l10n.t('创建位置：')}</div>
        <span className="libro-create-file-path">{data?.path}</span>
        <Form
          layout="vertical"
          autoComplete="off"
          form={form}
          onFinish={onFinish}
          className="libro-create-dir-file-form"
        >
          <Form.Item
            name="dirName"
            label={l10n.t('文件夹名称')}
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
    </ConfigProvider>
  );
};

export const FileDirCreateModal: ModalItem<FileDirCreateModalItemType> = {
  id: 'file.createdir.modal',
  component: FileCreateDirModalComponent,
};
