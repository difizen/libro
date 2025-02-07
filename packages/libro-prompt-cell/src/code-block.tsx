import { CopyOutlined, EditOutlined } from '@ant-design/icons';
import type { DisplayDataOutputModel } from '@difizen/libro-jupyter';
import { copy2clipboard } from '@difizen/libro-jupyter';
import { useInject, ViewInstance } from '@difizen/libro-common/app';
import { Collapse } from 'antd';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { LibroPromptCellView } from './prompt-cell-view.js';

export const CodeBlock = (props: any) => {
  const { className, children } = props;

  if (!props.inline && className) {
    const [, lang] = /language-(\w+)/.exec(className || '') || [];

    return (
      <pre className={`chat-msg-md-code-wrap`}>
        {lang && <div className={`chat-msg-md-code-lang`}>{lang}</div>}
        <CopyOutlined
          onClick={() => {
            copy2clipboard(children);
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
      </pre>
    );
  }

  return <code className={`chat-msg-md-code-code`}>{children}</code>;
};

export const InterpreterCodeBlock = (props: any) => {
  const { className, children } = props;
  const instance = useInject<DisplayDataOutputModel>(ViewInstance);
  const cell = instance.cell;
  if (!(cell instanceof LibroPromptCellView)) {
    return null;
  }

  const replace = (data: string) => {
    if (cell.editor) {
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
      <Collapse
        ghost
        items={[
          {
            key: '1',
            label: 'Code',
            children: (
              <p>
                <div className="libro-code-interpreter-code">
                  <pre className={`chat-msg-md-code-wrap`}>
                    {
                      <div
                        className="libro-interpreter-edit-container"
                        onClick={() => {
                          cell.interpreterEditMode = true;
                          if (cell.model.interpreterCode) {
                            replace(cell.model.interpreterCode);
                          }
                        }}
                      >
                        <div className="libro-interpreter-edit-tip">代码编辑</div>
                        <EditOutlined className="libro-interpreter-edit-icon" />
                      </div>
                    }
                    <SyntaxHighlighter
                      className={`libro-llm-syntax-highlighter`}
                      language={lang}
                      style={{}}
                    >
                      {typeof children === 'string' ? children.trim() : children}
                    </SyntaxHighlighter>
                  </pre>
                </div>
              </p>
            ),
          },
        ]}
      ></Collapse>
    );
  }

  return <code className={`chat-msg-md-code-code`}>{children}</code>;
};
