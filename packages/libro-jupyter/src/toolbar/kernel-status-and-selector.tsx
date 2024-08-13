import { red, green, gold, blue } from '@ant-design/colors';
import { LoadingOutlined, StopOutlined } from '@ant-design/icons';
import type { LibroView } from '@difizen/libro-core';
import { ServerManager } from '@difizen/libro-kernel';
import { useInject, ViewInstance } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Badge } from 'antd';

import { LibroJupyterModel } from '../libro-jupyter-model.js';

import { KernelSelector } from './kernel-selector-dropdown.js';

import './index.less';

export interface ServerStatus {
  category: string;
  color: string;
  text: string;
  text_zh: string;
}

export const statusToColor = {
  canRunImmediate: green[5],
  canRun: blue[5],
  blocking: gold[5],
  error: red[4],
};

export const jupyterServiceStatus: Record<string, ServerStatus> = {
  loading: {
    category: 'JupyterService',
    color: statusToColor.blocking,
    text: 'loading',
    text_zh: l10n.t('加载中'),
  },
  failed: {
    category: 'JupyterService',
    color: statusToColor.error,
    text: 'failed',
    text_zh: l10n.t('加载失败'),
  },
  loaded: {
    category: 'JupyterService',
    color: statusToColor.canRunImmediate,
    text: 'loaded',
    text_zh: l10n.t('加载完成'),
  },
};

export const kernelStatus: Record<string, ServerStatus> = {
  connecting: {
    category: 'Kernel',
    color: statusToColor.blocking,
    text: 'connecting',
    text_zh: l10n.t('正在连接'),
  },
  unknown: {
    category: 'Kernel',
    color: statusToColor.blocking,
    text: 'unknown',
    text_zh: l10n.t('未知'),
  },
  starting: {
    category: 'Kernel',
    color: statusToColor.blocking,
    text: 'starting',
    text_zh: l10n.t('启动中'),
  },
  idle: {
    category: 'Kernel',
    color: statusToColor.canRunImmediate,
    text: 'idle',
    text_zh: l10n.t('空闲'),
  },
  busy: {
    category: 'Kernel',
    color: statusToColor.canRun,
    text: 'busy',
    text_zh: l10n.t('忙碌'),
  },
  terminating: {
    category: 'Kernel',
    color: statusToColor.blocking,
    text: 'terminating',
    text_zh: l10n.t('终止中'),
  },
  restarting: {
    category: 'Kernel',
    color: statusToColor.blocking,
    text: 'restarting',
    text_zh: l10n.t('重启中'),
  },
  autorestarting: {
    category: 'Kernel',
    color: statusToColor.blocking,
    text: 'autorestarting',
    text_zh: l10n.t('自动重启中'),
  },
  dead: {
    category: 'Kernel',
    color: statusToColor.error,
    text: 'dead',
    text_zh: l10n.t('死亡'),
  },
};

const getServiceStatusInfo = (
  serverManager: ServerManager | undefined,
  libroModel: LibroJupyterModel | undefined,
): ServerStatus => {
  if (!serverManager || serverManager.launching) {
    return jupyterServiceStatus['loading'];
  }

  if (
    !libroModel ||
    !(libroModel instanceof LibroJupyterModel) ||
    libroModel.kernelConnecting === true ||
    libroModel.kernelConnecting === undefined
  ) {
    return kernelStatus['connecting'];
  }

  if (!libroModel.kernelConnection) {
    return {
      color: statusToColor.blocking,
      text: 'no kernel',
      category: 'Kernel',
      text_zh: l10n.t('无内核'),
    };
  }

  return kernelStatus[libroModel.kernelConnection.status];
};

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
          <span className="kernel">kernel：</span>
          <KernelSelector />
          {showBadge &&
            (isKernelBusy ? (
              <Badge
                className="libro-kernel-badge"
                key="libro-kernel-badge"
                color={kernelStatus['busy'].color}
                text={kernelStatus['busy'].text_zh}
              />
            ) : (
              <Badge
                className="libro-kernel-badge"
                key="libro-kernel-badge"
                color={color}
                text={text_zh}
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
