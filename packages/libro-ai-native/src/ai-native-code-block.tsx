import { CopyOutlined } from '@ant-design/icons';
import { LibroCodeCellView } from '@difizen/libro-jupyter';
import { useInject, ViewInstance } from '@difizen/mana-app';
import { Button, message } from 'antd';
import copy from 'copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import './index.less';
import type { LibroAINativeForCellView } from './ai-native-for-cell-view.js';

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
            message.success('代码已复制');
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
          <Button color="primary" variant="text" onClick={() => replace(children)}>
            替换代码
          </Button>
          <Button
            color="default"
            variant="text"
            onClick={() => {
              instance.showAI = false;
            }}
          >
            取消
          </Button>
        </div>
      </pre>
    );
  }

  return <code className={`chat-msg-md-code-code`}>{children}</code>;
};
