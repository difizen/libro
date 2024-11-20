import { CopyOutlined } from '@ant-design/icons';
import { copy2clipboard } from '@difizen/libro-common';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export const CodeBlock = (props: any) => {
  const { className, value } = props;

  if (!props.inline && className) {
    const [, lang] = /language-(\w+)/.exec(className || '') || [];

    return (
      <pre className={`chat-msg-md-code-wrap`}>
        {lang && <div className={`chat-msg-md-code-lang`}>{lang}</div>}
        <CopyOutlined
          onClick={() => {
            copy2clipboard(value);
          }}
          className={`chat-msg-md-code-copy`}
        />
        <SyntaxHighlighter
          className={`libro-llm-syntax-highlighter`}
          language={lang}
          style={{}}
        >
          {typeof value === 'string' ? value.trim() : value}
        </SyntaxHighlighter>
      </pre>
    );
  }

  return <code className={`chat-msg-md-code-code`}>{value}</code>;
};
