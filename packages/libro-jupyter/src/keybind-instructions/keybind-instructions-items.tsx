import { singleton } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export interface DataType {
  key: React.Key;
  actionDescription: React.ReactNode;
  keybind: React.ReactNode;
}

@singleton()
export class LibroKeybindItems {
  commandModeActionColumns: ColumnsType<DataType> = [
    {
      title: l10n.t('命令态操作'),
      dataIndex: 'actionDescription',
      width: '125px',
    },
    {
      title: l10n.t('快捷键'),
      // width: '100px',
      dataIndex: 'keybind',
    },
  ];

  editModeActionColumns: ColumnsType<DataType> = [
    {
      title: l10n.t('编辑态操作'),
      dataIndex: 'actionDescription',
      width: '125px',
    },
    {
      title: l10n.t('快捷键'),
      dataIndex: 'keybind',
    },
  ];

  editModeData: DataType[] = [
    {
      key: '1',
      actionDescription: l10n.t('保存文件'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>S</Tag>
        </>
      ),
    },
    {
      key: '2',
      actionDescription: l10n.t('运行选中cell'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Enter</Tag>
        </>
      ),
    },
    {
      key: '3',
      actionDescription: l10n.t('运行并选择下一个cell'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>Enter</Tag>
        </>
      ),
    },
    {
      key: '4',
      actionDescription: l10n.t('运行并新增cell'),
      keybind: (
        <>
          <Tag>Alt</Tag>
          <Tag>Enter</Tag>
        </>
      ),
    },
    {
      key: '5',
      actionDescription: l10n.t('隐藏Code'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>&apos;</Tag>
        </>
      ),
    },
    {
      key: '6',
      actionDescription: l10n.t('隐藏Output'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>O</Tag>
        </>
      ),
    },
    {
      key: '7',
      actionDescription: l10n.t('切分cell'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Shift</Tag>
          <Tag>-</Tag>
        </>
      ),
    },
    {
      key: '8',
      actionDescription: l10n.t('选中当前所在行'),
      keybind: (
        <>
          <Tag>Command</Tag>
          <Tag>L</Tag>{' '}
        </>
      ),
    },
    {
      key: '9',
      actionDescription: l10n.t('全选'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>A</Tag>
        </>
      ),
    },
    {
      key: '10',
      actionDescription: l10n.t('光标移至行首'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Left</Tag>
        </>
      ),
    },
    {
      key: '11',
      actionDescription: l10n.t('光标移至行尾'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Right</Tag>
        </>
      ),
    },
    {
      key: '12',
      actionDescription: l10n.t('光标移至文档首'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Up</Tag>
        </>
      ),
    },
    {
      key: '13',
      actionDescription: l10n.t('光标移至文档尾'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Down</Tag>
        </>
      ),
    },
    {
      key: '14',
      actionDescription: l10n.t('向上移动当前所在行'),
      keybind: (
        <>
          <Tag>Alt</Tag>
          <Tag>Up</Tag>
        </>
      ),
    },
    {
      key: '15',
      actionDescription: l10n.t('向下移动当前所在行'),
      keybind: (
        <>
          <Tag>Alt</Tag>
          <Tag>Down</Tag>
        </>
      ),
    },
    {
      key: '16',
      actionDescription: l10n.t('向上拷贝当前所在行'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>Alt</Tag>
          <Tag>Up</Tag>
        </>
      ),
    },
    {
      key: '17',
      actionDescription: l10n.t('向下拷贝当前所在行'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>Alt</Tag>
          <Tag>Down</Tag>
        </>
      ),
    },
    {
      key: '18',
      actionDescription: l10n.t('删除光标至行首内容'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Backspace</Tag>
        </>
      ),
    },
    {
      key: '19',
      actionDescription: l10n.t('删除光标至行尾内容'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Delete</Tag>
        </>
      ),
    },
    {
      key: '20',
      actionDescription: l10n.t('撤销'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Z</Tag>
        </>
      ),
    },
    {
      key: '21',
      actionDescription: l10n.t('恢复'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Shift</Tag>
          <Tag>Z</Tag>
        </>
      ),
    },
    {
      key: '22',
      actionDescription: l10n.t('撤销选中'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>U</Tag>{' '}
        </>
      ),
    },
    {
      key: '23',
      actionDescription: l10n.t('恢复选中'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Shift</Tag>
          <Tag>U</Tag>
        </>
      ),
    },
  ];

  commandModeData: DataType[] = [
    {
      key: '1',
      actionDescription: l10n.t('保存文件'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>S</Tag>
        </>
      ),
    },
    {
      key: '2',
      actionDescription: l10n.t('运行选中cell'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Enter</Tag>
        </>
      ),
    },
    {
      key: '3',
      actionDescription: l10n.t('运行并选择下一个cell'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>Enter</Tag>
        </>
      ),
    },
    {
      key: '4',
      actionDescription: l10n.t('运行并新增cell'),
      keybind: (
        <>
          <Tag>Alt</Tag>
          <Tag>Enter</Tag>
        </>
      ),
    },
    {
      key: '5',
      actionDescription: l10n.t('选中上个cell'),
      keybind: (
        <>
          <Tag>Up</Tag>/<Tag>K</Tag>
        </>
      ),
    },
    {
      key: '6',
      actionDescription: l10n.t('隐藏Code'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>&apos;</Tag>
        </>
      ),
    },
    {
      key: '7',
      actionDescription: l10n.t('隐藏Output'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>O</Tag>
        </>
      ),
    },
    {
      key: '8',
      actionDescription: l10n.t('选中下个cell'),
      keybind: (
        <>
          <Tag>Down</Tag>/<Tag>J</Tag>
        </>
      ),
    },
    {
      key: '9',
      actionDescription: l10n.t('向上新增cell'),
      keybind: (
        <>
          <Tag>A</Tag>
        </>
      ),
    },
    {
      key: '10',
      actionDescription: l10n.t('向下新增cell'),
      keybind: (
        <>
          <Tag>B</Tag>
        </>
      ),
    },
    {
      key: '11',
      actionDescription: l10n.t('删除选中cell'),
      keybind: (
        <>
          <Tag>D D</Tag>
        </>
      ),
    },
    {
      key: '12',
      actionDescription: l10n.t('复制cell'),
      keybind: (
        <>
          <Tag>C</Tag>
        </>
      ),
    },
    {
      key: '13',
      actionDescription: l10n.t('剪切cell'),
      keybind: (
        <>
          <Tag>X</Tag>
        </>
      ),
    },
    {
      key: '14',
      actionDescription: l10n.t('粘贴cell'),
      keybind: (
        <>
          <Tag>V</Tag>
        </>
      ),
    },
    {
      key: '15',
      actionDescription: l10n.t('上移cell'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Shift</Tag>
          <Tag>Up</Tag>
        </>
      ),
    },
    {
      key: '16',
      actionDescription: l10n.t('下移cell'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Shift</Tag>
          <Tag>Down</Tag>
        </>
      ),
    },
    {
      key: '17',
      actionDescription: l10n.t('合并选中cell'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>M</Tag>
        </>
      ),
    },
    {
      key: '18',
      actionDescription: l10n.t('向下合并cell'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Shift</Tag>
          <Tag>M</Tag>
        </>
      ),
    },
    {
      key: '19',
      actionDescription: l10n.t('向上合并cell'),
      keybind: (
        <>
          <Tag>Cmd</Tag>
          <Tag>Backspace</Tag>
        </>
      ),
    },
    {
      key: '20',
      actionDescription: l10n.t('撤销'),
      keybind: (
        <>
          <Tag>Z</Tag>
        </>
      ),
    },
    {
      key: '21',
      actionDescription: l10n.t('恢复'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>Z</Tag>
        </>
      ),
    },
    {
      key: '22',
      actionDescription: l10n.t('转为Code Cell'),
      keybind: (
        <>
          <Tag>Y</Tag>
        </>
      ),
    },
    {
      key: '23',
      actionDescription: l10n.t('转为Markdown Cell'),
      keybind: (
        <>
          <Tag>M</Tag>
        </>
      ),
    },
    {
      key: '24',
      actionDescription: l10n.t('转为一级标题'),
      keybind: (
        <>
          <Tag>1</Tag>
        </>
      ),
    },
    {
      key: '25',
      actionDescription: l10n.t('转为二级标题'),
      keybind: (
        <>
          <Tag>2</Tag>
        </>
      ),
    },
    {
      key: '26',
      actionDescription: l10n.t('转为三级标题'),
      keybind: (
        <>
          <Tag>3</Tag>
        </>
      ),
    },
    {
      key: '27',
      actionDescription: l10n.t('转为四级标题'),
      keybind: (
        <>
          <Tag>4</Tag>
        </>
      ),
    },
    {
      key: '28',
      actionDescription: l10n.t('转为五级标题'),
      keybind: (
        <>
          <Tag>5</Tag>
        </>
      ),
    },
    {
      key: '29',
      actionDescription: l10n.t('转为六级标题'),
      keybind: (
        <>
          <Tag>6</Tag>
        </>
      ),
    },
    {
      key: '30',
      actionDescription: l10n.t('向上多选Cell'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>Up</Tag>/<Tag>Shift</Tag>
          <Tag>K</Tag>
        </>
      ),
    },
    {
      key: '31',
      actionDescription: l10n.t('向下多选Cell'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>Down</Tag>/<Tag>Shift</Tag>
          <Tag>J</Tag>
        </>
      ),
    },
    {
      key: '32',
      actionDescription: l10n.t('选中当前及之前cell'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>Home</Tag>
        </>
      ),
    },
    {
      key: '33',
      actionDescription: l10n.t('选中当前及之后cell'),
      keybind: (
        <>
          <Tag>Shift</Tag>
          <Tag>End</Tag>
        </>
      ),
    },
  ];
}
