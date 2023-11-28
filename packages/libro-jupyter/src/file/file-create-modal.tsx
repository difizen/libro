import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { URI, useInject, ViewManager } from '@difizen/mana-app';
import type { InputRef } from 'antd';
import { Input, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { FileView, JupyterFileService } from './index.js';

export interface ModalItemType {
  path: string;
}

export const FileCreateModalComponent: React.FC<ModalItemProps<ModalItemType>> = ({
  visible,
  close,
  data,
}: ModalItemProps<ModalItemType>) => {
  const fileService = useInject(JupyterFileService);
  const viewManager = useInject(ViewManager);
  const [newFileName, setNewFileName] = useState('');
  const [fileView, setFileView] = useState<FileView>();
  const inputRef = useRef<InputRef>(null);

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
      onOk={async () => {
        await fileService.newFile(newFileName, new URI(data.path));
        if (fileView) {
          fileView.model.refresh();
        }
        close();
      }}
      keyboard={true}
    >
      <Input
        value={newFileName}
        onChange={(e) => {
          setNewFileName(e.target.value);
        }}
        ref={inputRef}
        onKeyDown={async (e) => {
          if (e.keyCode === 13) {
            await fileService.newFile(newFileName, new URI(data.path));
            if (fileView) {
              fileView.model.refresh();
            }
            close();
          }
        }}
      />
    </Modal>
  );
};

export const FileCreateModal: ModalItem<ModalItemType> = {
  id: 'file.create.modal',
  component: FileCreateModalComponent,
};
