import { CaretDownOutlined } from '@ant-design/icons';
import type { LibroView } from '@difizen/libro-core';
import { LibroKernelConnectionManager, KernelSpecManager } from '@difizen/libro-kernel';
import { ConfigurationService, useInject, ViewInstance } from '@difizen/mana-app';
import { Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { LibroJupyterConfiguration } from '../config/index.js';
import { LibroJupyterModel } from '../libro-jupyter-model.js';
import './index.less';
import { l10n } from '@difizen/mana-l10n';

export interface PreferredSessionKernelListElem {
  name: string;
  id: string;
  fileName: string;
}

export interface OtherKernelListElem {
  name: string;
  display_name: string;
}

function getKernelList(
  kernelConnectionManager: LibroKernelConnectionManager,
  kernelSpecManager: KernelSpecManager,
): [PreferredSessionKernelListElem[], OtherKernelListElem[]] {
  const preferredSessionKernelList = [];
  for (const [fileName, kc] of kernelConnectionManager.getAllKernelConnections()) {
    preferredSessionKernelList.push({
      fileName: fileName,
      name: kc.name,
      id: kc.id,
    });
  }

  const otherKernelList = [];
  if (
    kernelSpecManager.specs &&
    kernelSpecManager.specs.kernelspecs &&
    !(Object.keys(kernelSpecManager.specs.kernelspecs).length === 0)
  ) {
    const kernelspecs = kernelSpecManager.specs.kernelspecs;

    for (const key in kernelspecs) {
      otherKernelList.push({
        name: kernelspecs[key]?.name ?? '',
        display_name: kernelspecs[key]?.display_name ?? '',
      });
    }
  }

  return [preferredSessionKernelList, otherKernelList];
}

function getKernelListItems(
  preferredSessionKernelList: PreferredSessionKernelListElem[],
  otherKernelList: OtherKernelListElem[],
  allowPreferredSession: boolean,
) {
  const array: MenuProps['items'] = [
    {
      key: 'StartPreferredKernel',
      type: 'group',
      label: l10n.t('启动首选的 Kernel'),
      children: otherKernelList.map((item) => {
        return {
          key: item.name,
          label: item.display_name,
        };
      }),
    },
    {
      key: 'UseNoKernel',
      type: 'group',
      label: l10n.t('不使用 Kernel'),
      children: [
        {
          key: 'No Kernel',
          label: l10n.t('无 Kernel'),
        },
      ],
    },
    {
      key: 'divider1',
      type: 'divider', // Must have
    },
    {
      key: 'RestartKernel',
      label: l10n.t('重启 Kernel'),
    },
    {
      key: 'ShutDownKernel',
      label: l10n.t('关闭 Kernel'),
    },
  ];
  if (allowPreferredSession) {
    array.splice(2, 0, {
      key: 'UseKernelFromPreferredSession',
      type: 'group',
      label: l10n.t('使用首选 Session 的 Kernel'),
      children: preferredSessionKernelList.map((item) => {
        return {
          key: item.fileName,
          label: item.fileName,
        };
      }),
    });
  }
  return array;
}

export const KernelSelector: React.FC = () => {
  const libroView = useInject<LibroView>(ViewInstance);
  const configService = useInject<ConfigurationService>(ConfigurationService);
  const [allowPreferredSession, setAllowPreferredSession] = useState<boolean>(true);

  useEffect(() => {
    configService
      .get(LibroJupyterConfiguration['AllowPreferredSession'])
      .then((value) => {
        setAllowPreferredSession(value);
        return;
      })
      .catch(() => {
        //
      });
  });

  const libroModel = libroView ? libroView.model : undefined;

  const kernelConnectionManager = useInject(LibroKernelConnectionManager);
  const kernelSpecManager = useInject(KernelSpecManager);

  const [preferredSessionKernelList, otherKernelList] = getKernelList(
    kernelConnectionManager,
    kernelSpecManager,
  );

  // 处理change kernel
  const handleChange = useCallback(
    (key: string) => {
      const selectValue = key;
      if (!libroView || !(libroView.model instanceof LibroJupyterModel)) {
        return null;
      }

      libroView.model.kernelConnecting = true;

      if (selectValue === 'No Kernel' || selectValue === 'ShutDownKernel') {
        libroView.model.kernelConnecting = false;
        if (libroView.model.shutdown) {
          libroView.model.shutdown();
        }
      }

      if (selectValue === 'RestartKernel') {
        libroView.model.kernelConnecting = false;
        if (libroView.model.restart) {
          libroView.model.restart();
        }
      }

      const kernelInfoFromOtherKernelList = otherKernelList.filter(
        (k) => k.name === selectValue,
      );

      if (kernelInfoFromOtherKernelList.length !== 0) {
        libroView.model.currentFileContents.content.metadata.kernelspec =
          kernelInfoFromOtherKernelList[0];

        kernelConnectionManager
          .changeKernel(libroView.model.currentFileContents, {
            name: kernelInfoFromOtherKernelList[0].name,
          })
          .then((kernelConnection) => {
            if (!kernelConnection) {
              return;
            }
            (libroView.model as LibroJupyterModel).kernelConnection = kernelConnection;
            (libroView.model as LibroJupyterModel).kernelConnecting = false;
            return;
          })
          .catch(console.error);

        return;
      }

      const kernelInfoFromPreferredSessionKernelList =
        preferredSessionKernelList.filter((k) => k.fileName === selectValue);
      if (kernelInfoFromPreferredSessionKernelList.length !== 0) {
        kernelConnectionManager
          .changeKernel(libroView.model.currentFileContents, {
            id: kernelInfoFromPreferredSessionKernelList[0].id,
            name: kernelInfoFromPreferredSessionKernelList[0].name,
          })
          .then((kernelConnection) => {
            if (!kernelConnection) {
              return;
            }
            (libroView.model as LibroJupyterModel).kernelConnection = kernelConnection;
            (libroView.model as LibroJupyterModel).kernelConnecting = false;
            return;
          })
          .catch(console.error);
      }

      libroView.model.kernelConnecting = false;
      return;
    },
    [libroView, otherKernelList, preferredSessionKernelList, kernelConnectionManager],
  );

  return (
    <Dropdown
      overlayClassName="libro-kernel-dropdown"
      menu={{
        items: getKernelListItems(
          preferredSessionKernelList,
          otherKernelList,
          allowPreferredSession,
        ),
        onClick: ({ key }) => handleChange(key),
      }}
      trigger={['click']}
    >
      <Space>
        {(libroModel as LibroJupyterModel)?.kernelConnection?.isDisposed
          ? l10n.t('无 Kernel')
          : (libroModel as LibroJupyterModel)?.kernelConnection?.name ||
            l10n.t('无 Kernel')}
        <CaretDownOutlined />
      </Space>
    </Dropdown>
  );
};
