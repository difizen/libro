import type { ModalItem, ModalItemProps, URI } from '@difizen/mana-app';
import { useInject, ViewManager } from '@difizen/mana-app';
import type { InputRef } from 'antd';
import { Input, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { JupyterFileService } from './file-service.js';
import { FileView } from './file-view/index.js';

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
  const [newFileName, setNewFileName] = useState(data.fileName);
  const inputRef = useRef<InputRef>(null);
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
      title="文件重命名"
      open={visible}
      onCancel={close}
      onOk={async () => {
        await fileService.rename(data.resource, newFileName);
        if (fileView) {
          fileView.model.refresh();
        }
        close();
      }}
    >
      <Input
        value={newFileName}
        onChange={(e) => {
          setNewFileName(e.target.value);
        }}
        ref={inputRef}
      />
    </Modal>
  );
};

export const FileRenameModal: ModalItem<ModalItemType> = {
  id: 'file.rename.modal',
  component: FileRenameModalComponent,
};
