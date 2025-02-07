import type { ModalItemProps, ModalItem } from '@difizen/libro-common/app';
import { ThemeService } from '@difizen/libro-common/app';
import { CommandRegistry } from '@difizen/libro-common/app';
import { URI, useInject, ViewManager } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';
import { Col, Form, message, Row, Input, Modal, ConfigProvider, theme } from 'antd';
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
  fileType?: FileType;
}

type FileType = '.ipynb' | '.py' | '.json' | '.sql' | undefined;

export const FileCreateModalComponent: React.FC<ModalItemProps<ModalItemType>> = ({
  visible,
  close,
  data,
}: ModalItemProps<ModalItemType>) => {
  const fileService = useInject(JupyterFileService);
  const commands = useInject(CommandRegistry);
  const viewManager = useInject(ViewManager);
  const [fileType, setFileType] = useState<FileType>(data?.fileType);
  const [fileView, setFileView] = useState<FileView>();
  const inputRef = useRef<InputRef>(null);
  const themeService = useInject(ThemeService);
  const [form] = Form.useForm();

  const onFinish = async (values: { fileName: string }) => {
    await form.validateFields();
    close();
    try {
      const stat = await fileService.newFile(
        values.fileName + (fileType || ''),
        new URI(data?.path),
      );
      if (fileView) {
        fileView.model.refresh();
      }
      if (stat.isFile) {
        commands.executeCommand('fileTree.command.openfile', {
          fileStat: stat,
          uri: stat.resource,
        });
      }
      // message.success('新建文件成功');
    } catch {
      message.error(l10n.t('新建文件失败'));
    }
  };

  const validateFileName = async (rule: any, value: string, callback: any) => {
    if (!value || !value.length) {
      throw new Error(l10n.t('请输入文件名'));
    } else {
      const targetURI = new URI(data?.path + value + (fileType || ''));
      const fileRes = await fileService.resolve(targetURI);
      if (fileRes.isFile) {
        throw new Error(l10n.t('文件名称已存在，请重新输入'));
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
        title={l10n.t('新建文件')}
        open={visible}
        onCancel={close}
        width={788}
        cancelText={l10n.t('取消')}
        okText={l10n.t('确定')}
        onOk={() => {
          form.submit();
        }}
        keyboard={true}
        wrapClassName="libro-create-file-modal"
      >
        <div className="libro-create-file-path-container">
          <div className="libro-create-file-des">{l10n.t('创建位置：')}</div>
          <span className="libro-create-file-path">{data?.path}</span>
        </div>
        <div className="libro-create-file-des">{l10n.t('文件类型：')}</div>
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
                inputRef.current?.focus();
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
                inputRef.current?.focus();
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
              className={`libro-create-file-type ${
                fileType === '.json' ? 'active' : ''
              }`}
              onClick={() => {
                setFileType('.json');
                inputRef.current?.focus();
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
                inputRef.current?.focus();
              }}
            >
              <MoreIcon />
              <span className="libro-create-file-type-text">{l10n.t('其他')}</span>
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
            label={l10n.t('文件名称')}
            rules={[{ required: true, validator: validateFileName }]}
          >
            <Input addonAfter={fileType || ''} ref={inputRef} />
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export const FileCreateModal: ModalItem<ModalItemType> = {
  id: 'file.create.modal',
  component: FileCreateModalComponent,
};
