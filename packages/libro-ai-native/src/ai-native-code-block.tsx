import { CopyOutlined } from '@ant-design/icons';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { LibroCodeCellView } from '@difizen/libro-jupyter';
import { useInject, ViewInstance } from '@difizen/mana-app';
import { Button, message } from 'antd';
import copy from 'copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { v4 } from 'uuid';

import './index.less';
import type { LibroAINativeForCellView } from './ai-native-for-cell-view.js';
import type { LibroAiNativeChatView } from './libro-ai-native-chat-view.js';

export const CodeBlockInCell = (props: any) => {
  const { className, children } = props;
  const instance = useInject<LibroAINativeForCellView>(ViewInstance);
  const cell = instance.cell;

  const replace = (data: any) => {
    if (cell instanceof LibroCodeCellView && cell.editor) {
      const length = cell.editor.model.value.length;
      const start = cell.editor.getPositionAt(0);
      const end = cell.editor.getPositionAt(length);
      if (start && end) {
        cell.editor.replaceSelection(data, {
          start,
          end,
        });
      }
    }
  };

  if (!props.inline && className) {
    const [, lang] = /language-(\w+)/.exec(className || '') || [];

    return (
      <pre className={`chat-msg-md-code-wrap`}>
        {lang && <div className={`chat-msg-md-code-lang`}>{lang}</div>}
        <CopyOutlined
          onClick={() => {
            copy(children);
            message.success(l10n.t('代码已复制'));
          }}
          className={`chat-msg-md-code-copy`}
        />
        <SyntaxHighlighter
          className={`libro-llm-syntax-highlighter`}
          language={lang}
          style={{}}
        >
          {typeof children === 'string' ? children.trim() : children}
        </SyntaxHighlighter>
        <div className="libro-ai-native-debug-code-btn-container">
          <Button color="primary" variant="outlined" onClick={() => replace(children)}>
            {l10n.t('替换代码')}
          </Button>
        </div>
      </pre>
    );
  }

  return <code className={`chat-msg-md-code-code`}>{children}</code>;
};

export const CodeBlockInChat = (props: any) => {
  const { className, children } = props;
  const instance = useInject<LibroAiNativeChatView>(ViewInstance);
  const cell = instance.libro?.activeCell;

  const insertCell = async (data: any) => {
    const libro = instance.libro;
    if (!libro) {
      return;
    }
    const insertIndex = libro.model.cells.findIndex(
      (c) => c.id === libro.activeCell?.id,
    );
    await libro.addCell(
      {
        id: v4(),
        cell: { cell_type: 'code', source: data, metadata: {} },
      },
      insertIndex + 1,
    );
  };

  const replace = (data: any) => {
    if (cell instanceof LibroCodeCellView && cell.editor) {
      const length = cell.editor.model.value.length;
      const start = cell.editor.getPositionAt(0);
      const end = cell.editor.getPositionAt(length);
      if (start && end) {
        cell.editor.replaceSelection(data, {
          start,
          end,
        });
      }
    }
  };

  if (!props.inline && className) {
    const [, lang] = /language-(\w+)/.exec(className || '') || [];

    return (
      <pre className={`chat-msg-md-code-wrap`}>
        {lang && <div className={`chat-msg-md-code-lang`}>{lang}</div>}
        <CopyOutlined
          onClick={() => {
            copy(children);
            message.success(l10n.t('代码已复制'));
          }}
          className={`chat-msg-md-code-copy`}
        />
        <SyntaxHighlighter
          className={`libro-llm-syntax-highlighter`}
          language={lang}
          style={{}}
        >
          {typeof children === 'string' ? children.trim() : children}
        </SyntaxHighlighter>
        <div className="libro-ai-native-debug-code-btn-container">
          <Button
            color="primary"
            variant="outlined"
            onClick={() => insertCell(children)}
          >
            {l10n.t('插入 Cell')}
          </Button>
          <Button color="primary" variant="outlined" onClick={() => replace(children)}>
            {l10n.t('替换 Cell')}
          </Button>
        </div>
      </pre>
    );
  }

  return <code className={`chat-msg-md-code-code`}>{children}</code>;
};
