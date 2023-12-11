import { CaretDownOutlined } from '@ant-design/icons';
import type { LibroView } from '@difizen/libro-core';
import { LibroKernelConnectionManager, KernelSpecManager } from '@difizen/libro-kernel';
import { useInject, ViewInstance } from '@difizen/mana-app';
import { Dropdown, Space } from 'antd';
import { useCallback } from 'react';

import { LibroJupyterModel } from '../libro-jupyter-model.js';
import './index.less';

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
) {
  return [
    {
      key: 'StartPreferredKernel',
      type: 'group',
      label: 'Start Preferred Kernel',
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
      label: 'Use No Kernel',
      children: [
        {
          key: 'No Kernel',
          label: 'No Kernel',
        },
      ],
    },
    {
      key: 'UseKernelFromPreferredSession',
      type: 'group',
      label: 'Use Kernel from Preferred Session',
      children: preferredSessionKernelList.map((item) => {
        return {
          key: item.fileName,
          label: item.fileName,
        };
      }),
    },
    {
      key: 'divider1',
      type: 'divider', // Must have
    },
    {
      key: 'ShutDownKernel',
      label: 'Shut Down the Kernel',
    },
  ];
}

export const KernelSelector: React.FC = () => {
  const libroView = useInject<LibroView>(ViewInstance);

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
        items: getKernelListItems(preferredSessionKernelList, otherKernelList),
        onClick: ({ key }) => handleChange(key),
      }}
      trigger={['click']}
    >
      <Space>
        {(libroModel as LibroJupyterModel)?.kernelConnection?.isDisposed
          ? 'no kernel'
          : (libroModel as LibroJupyterModel)?.kernelConnection?.name || 'no kernel'}
        <CaretDownOutlined />
      </Space>
    </Dropdown>
  );
};
