import { LoadingOutlined, StopOutlined } from '@ant-design/icons';
import type { LibroView } from '@difizen/libro-core';
import { ServerManager } from '@difizen/libro-kernel';
import { useInject, ViewInstance } from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/l10n';
import { Badge } from 'antd';

import type { LibroJupyterModel } from '../libro-jupyter-model.js';
import './index.less';
import { kernelStatus } from '../libro-jupyter-protocol.js';
import { getServiceStatusInfo } from '../utils/index.js';

import { KernelSelector } from './kernel-selector-dropdown.js';

export const KernelStatusSelector: React.FC = () => {
  const libroView = useInject<LibroView>(ViewInstance);
  const serverManager = useInject(ServerManager);
  const libroModel = libroView?.model as LibroJupyterModel;
  const { color, text, text_zh, category } = getServiceStatusInfo(
    serverManager,
    libroModel,
  );

  if (serverManager.loaded) {
    const showBadge =
      (libroModel.kernelConnection && !libroModel.kernelConnection.isDisposed) ||
      text === 'connecting';
    const isKernelBusy = text === 'busy';

    return (
      <div className="libro-kernel-and-container-status">
        <div className="libro-kernel-status-and-selector">
          <span className="kernel">{l10n.t('Kernel：')}</span>
          <KernelSelector />
          {showBadge &&
            (isKernelBusy ? (
              <Badge
                className="libro-kernel-badge"
                key="libro-kernel-badge"
                color={kernelStatus['busy'].color}
                text={l10n.t(kernelStatus['busy'].text_zh)}
              />
            ) : (
              <Badge
                className="libro-kernel-badge"
                key="libro-kernel-badge"
                color={color}
                text={l10n.t(text_zh)}
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="libro-kernel-and-container-status">
      <div className="libro-container-and-service-status">
        {text !== 'failed' && (
          <>
            <LoadingOutlined className="loading-icon" />
            <span className="no-kernel">{l10n.t('Kernel 准备中...')}</span>
          </>
        )}
        {text === 'failed' && category === 'JupyterService' && (
          <>
            <StopOutlined className="failed-icon" />
            <span className="kernel-prepare-failed">{l10n.t('Kernel 准备失败')}</span>
          </>
        )}
      </div>
    </div>
  );
};
