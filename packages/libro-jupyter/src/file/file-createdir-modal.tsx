import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { URI } from '@difizen/mana-app';
import { ViewManager } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import type { InputRef } from 'antd';
import { Input } from 'antd';
import { Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { JupyterFileService } from './file-service.js';
import { FileView } from './file-view/index.js';

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
  const [dirName, setDirName] = useState('');
  const [fileView, setFileView] = useState<FileView>();
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
      onOk={async () => {
        await fileService.newFileDir(dirName, new URI(data.path));
        if (fileView) {
          fileView.model.refresh();
        }
        close();
      }}
      keyboard={true}
    >
      <Input
        value={dirName}
        onChange={(e) => {
          setDirName(e.target.value);
        }}
        ref={inputRef}
        onKeyDown={async (e) => {
          if (e.keyCode === 13) {
            await fileService.newFileDir(dirName, new URI(data.path));
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

export const FileDirCreateModal: ModalItem<ModalItemType> = {
  id: 'file.createdir.modal',
  component: FileCreateDirModalComponent,
};
