import { CopyOutlined } from '@ant-design/icons';
import { copy2clipboard } from '@difizen/libro-common';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

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
