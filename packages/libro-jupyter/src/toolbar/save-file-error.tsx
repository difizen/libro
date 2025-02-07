import type { LibroView } from '@difizen/libro-core';
import type { ModalItemProps, ModalItem } from '@difizen/libro-common/app';
import { ThemeService } from '@difizen/libro-common/app';
import { useInject, ViewInstance } from '@difizen/libro-common/app';
import { ConfigProvider, Modal, theme } from 'antd';

import type { LibroJupyterModel } from '../libro-jupyter-model.js';

export const SaveFileModalComponent: React.FC<ModalItemProps<void>> = ({
  visible,
  close,
}: ModalItemProps<void>) => {
  const libroView = useInject<LibroView>(ViewInstance);
  const themeService = useInject(ThemeService);
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
        title="File Save Error"
        open={visible}
        onOk={() => close()}
        onCancel={() => close()}
        width={'400px'}
        centered={true}
      >
        <p>{`File Save Error for: "${
          libroView && libroView.model
            ? (libroView.model as LibroJupyterModel).currentFileContents.name
            : ''
        }"`}</p>
      </Modal>
    </ConfigProvider>
  );
};

export const SaveFileErrorModal: ModalItem = {
  id: 'save-file-error',
  component: SaveFileModalComponent,
};
