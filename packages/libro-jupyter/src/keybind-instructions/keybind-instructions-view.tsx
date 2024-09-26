import { LibroContextKey } from '@difizen/libro-core';
import { inject, singleton, ThemeService } from '@difizen/mana-app';
import { getOrigin, prop, useInject } from '@difizen/mana-app';
import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import type { Disposable } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Input, Drawer, Table, Segmented, ConfigProvider, theme } from 'antd';
import { forwardRef, useCallback, useState } from 'react';

import type { DataType } from './keybind-instructions-items.js';
import { LibroKeybindItems } from './keybind-instructions-items.js';
import './index.less';

const { Search } = Input;

const getSearchResult = (
  value: string,
  sourceData: DataType[],
  targetData: DataType[],
) => {
  sourceData.forEach((dataItem) => {
    if (
      typeof dataItem.actionDescription === 'string' &&
      dataItem.actionDescription.indexOf(value) !== -1
    ) {
      const matchIndex = dataItem.actionDescription.indexOf(value);
      targetData.push({
        key: dataItem.key,
        actionDescription: (
          <>
            <span>{dataItem.actionDescription.substring(0, matchIndex)}</span>
            <span className="libro-keybind-search-match">
              {dataItem.actionDescription.substring(
                matchIndex,
                matchIndex + value.length,
              )}
            </span>
            <span>
              {dataItem.actionDescription.substring(matchIndex + value.length)}
            </span>
          </>
        ),

        keybind: dataItem.keybind,
      });
    }
  });
};

@singleton()
export class KeybindInstrutionsService implements Disposable {
  @inject(LibroContextKey) contextKey: LibroContextKey;
  isKeybindInstructionsMask = false;
  @prop() searchCommandModeData: DataType[] = [];
  @prop() searchEditModeData: DataType[] = [];

  dispose() {
    this.searchCommandModeData = [];
    this.searchEditModeData = [];
  }
}

type Segment = 'keybind' | 'magic';

export const KeybindInstrutionsComponent = forwardRef<
  HTMLDivElement,
  ModalItemProps<void>
>(function KeybindInstrutionsComponent(props, ref) {
  const { visible, close } = props;
  const [segment, setSegment] = useState<Segment>('keybind');
  const keybindInstrutionsService = useInject<KeybindInstrutionsService>(
    KeybindInstrutionsService,
  );
  const themeService = useInject(ThemeService);
  const libroKeybindItems = useInject(LibroKeybindItems);
  const handleClose = useCallback(() => {
    close();
    keybindInstrutionsService.contextKey.enableCommandMode();
    keybindInstrutionsService.dispose();
  }, [close, keybindInstrutionsService]);
  const handleSearch = (value: string) => {
    keybindInstrutionsService.searchCommandModeData = [];
    keybindInstrutionsService.searchEditModeData = [];
    getSearchResult(
      value,
      libroKeybindItems.commandModeData,
      keybindInstrutionsService.searchCommandModeData,
    );
    getSearchResult(
      value,
      libroKeybindItems.editModeData,
      keybindInstrutionsService.searchEditModeData,
    );
  };

  const magicColumns = [
    {
      title: l10n.t('关键字'),
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: l10n.t('含义'),
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const magics = [
    {
      key: '1',
      value: '%timeit',
      description: `${l10n.t('测试单行语句的运行时间')}`,
    },
    {
      key: '2',
      value: '%%timeit',
      description: l10n.t('测试整个块中代码的运行时间'),
    },
    {
      key: '3',
      value: '%run',
      description: l10n.t('调用外部 python 脚本'),
    },
    {
      key: '4',
      value: '%pwd',
      description: l10n.t('查看当前工作目录'),
    },
    {
      key: '5',
      value: '%ls',
      description: l10n.t('查看目录文件列表'),
    },
    {
      key: '6',
      value: '%reset',
      description: l10n.t('清除全部变量'),
    },
    {
      key: '7',
      value: '%who',
      description: l10n.t(
        '查看所有全局变量的名称，若给定类型参数，只返回该类型的变量列表',
      ),
    },
    {
      key: '8',
      value: '%whos',
      description: l10n.t('显示所有的全局变量名称、类型、值/信息'),
    },
    {
      key: '9',
      value: '%env',
      description: l10n.t('列出全部环境变量'),
    },
  ];

  const commandModeDataSource = getOrigin(
    keybindInstrutionsService.searchCommandModeData.length > 0
      ? keybindInstrutionsService.searchCommandModeData
      : libroKeybindItems.commandModeData,
  );

  const editModeDataSource = getOrigin(
    keybindInstrutionsService.searchEditModeData.length > 0
      ? keybindInstrutionsService.searchEditModeData
      : libroKeybindItems.editModeData,
  );

  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeService.getCurrentTheme().type === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <div className="libro-keybind-instructions-command" ref={ref}>
        <Drawer
          title={l10n.t('快捷键')}
          placement="right"
          onClose={handleClose}
          width="330px"
          open={visible}
          mask={true}
          className="libro-keybind-instructions-drawer"
          maskClosable={true}
        >
          <Segmented
            value={segment}
            onChange={(value) => setSegment(value as Segment)}
            options={[
              { label: l10n.t('快捷键'), value: 'keybind' },
              { label: l10n.t('Magic 命令'), value: 'magic' },
            ]}
          />

          {segment === 'magic' && (
            <div className="libro-magic-table">
              <Table
                size="small"
                columns={magicColumns}
                dataSource={magics}
                pagination={false}
                rowKey="key"
              />
            </div>
          )}
          {segment === 'keybind' && (
            <>
              <div className="libro-keybind-instructions-command-search">
                <Search
                  placeholder={l10n.t('搜索功能关键字')}
                  allowClear
                  bordered={false}
                  size="middle"
                  onSearch={handleSearch}
                />
              </div>
              <div className="libro-keybind-instructions-table">
                <div className="libro-command-mode-keybind-instructions-table">
                  <Table
                    rowKey="key"
                    columns={libroKeybindItems.commandModeActionColumns}
                    dataSource={commandModeDataSource}
                    pagination={false}
                  />
                </div>
                <div className="libro-edit-mode-keybind-instructions-table">
                  <Table
                    rowKey="key"
                    columns={libroKeybindItems.editModeActionColumns}
                    dataSource={editModeDataSource}
                    pagination={false}
                  />
                </div>
              </div>
            </>
          )}
        </Drawer>
      </div>
    </ConfigProvider>
  );
});

export const KeybindInstrutionModal: ModalItem = {
  id: 'libro-keybind-instructions-modal',
  component: KeybindInstrutionsComponent,
};
