import { ToolbarRender } from '@difizen/mana-app';
import hljs from 'highlight.js';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import React, { useEffect, useRef, memo, useState, useMemo } from 'react';
import 'highlight.js/styles/default.css';
import { createPortal } from 'react-dom';
import './index.less';

marked.use(
  markedKatex({
    throwOnError: false,
    output: 'mathml',
  }),
  markedHighlight({
    langPrefix: 'libro-llm-hljs code-block language-',
    highlight(code: string, lang: string) {
      const language = hljs.getLanguage(lang) ? lang : 'python';
      return hljs.highlight(code, { language }).value;
    },
  }),
  { headerIds: false, mangle: false },
);

export const LibroLLMRender: React.FC<{ data: string }> = (props: { data: string }) => {
  const { data } = props;

  const renderMarkdownRef = useRef<HTMLDivElement>(null);
  // const LLMExtraRender = useInject<LLMExtraRenderProvider>(LLMExtraRenderProvider);
  const [renderExtraList, setRenderExtraList] = useState<HTMLDivElement[]>([]);
  const codeToolbarArgs = useMemo(() => {
    return [data, 'CodeToolbar'];
  }, [data]);

  useEffect(() => {
    if (!renderMarkdownRef.current) {
      return;
    }
    renderMarkdownRef.current.innerHTML = marked.parse(data);

    const hljsElements =
      renderMarkdownRef.current.getElementsByClassName('libro-llm-hljs');

    for (let i = 0; i < hljsElements.length; i++) {
      const newElement = document.createElement('div');
      const newRenderExtraList = [...renderExtraList, newElement];
      setRenderExtraList(newRenderExtraList);
      const hljsElement = hljsElements.item(i);
      if (hljsElement) {
        hljsElement.parentNode?.insertBefore(newElement, hljsElement.nextSibling);
      }
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="libro-llm-output-render" ref={renderMarkdownRef}>
      {renderExtraList.map((element) => {
        return createPortal(<ToolbarRender data={codeToolbarArgs} />, element);
      })}
    </div>
  );
};
export const LibroLLMRenderMemo = memo(LibroLLMRender);
