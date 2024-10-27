import type { IError, IRenderMimeRegistry } from '@difizen/libro-jupyter';
import {
  ErrorOutputModel,
  defaultSanitizer,
  RenderMimeRegistry,
  renderText,
} from '@difizen/libro-jupyter';
import { prop, transient, ViewManager } from '@difizen/mana-app';
import { getOrigin, useInject, view, ViewInstance } from '@difizen/mana-app';
import { Button } from 'antd';
import { forwardRef, createRef, useEffect } from 'react';
import './index.less';

import { LibroAINativeForCellView } from './ai-native-for-cell-view.js';
import { AIIcon } from './icon.js';

const AIErrorOutputModelRender = forwardRef<HTMLDivElement>(
  function ErrorOutputModelRender(_props, ref) {
    const output = useInject<AIErrorOutputModel>(ViewInstance);
    const viewManager = useInject<ViewManager>(ViewManager);
    const model = getOrigin(output);
    const source = getOrigin(output).raw as IError;
    const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);
    const traceback = source.traceback.join('\n');
    const defaultRenderMimeType = defaultRenderMime.preferredMimeType(model);
    const streamRef = createRef<HTMLDivElement>();

    useEffect(() => {
      renderText({
        host: streamRef.current as HTMLDivElement,
        sanitizer: defaultSanitizer,
        source: traceback,
        mimeType: defaultRenderMimeType || '',
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleShowErrorDetail = () => {
      output.showErrorDetail = !output.showErrorDetail;
    };

    const handleFixWithAI = async () => {
      const libroAINativeForCellView = await viewManager.getOrCreateView(
        LibroAINativeForCellView,
        { id: output.cell.id },
      );

      libroAINativeForCellView.chatStream({
        chat_key: 'LLM:debug-gpt4',
        content:
          "代码为:\nplt.figure(figsize=(8, 6))\nplt.plot(df['A'], label='A')\nplt.plot(df['B'], label='B')\nplt.plot(df['C'], label='C')\nplt.title('Random Data Line Plot')\nplt.xlabel('Index')\nplt.ylabel('Value')\nplt.legend()\nplt.grid(True)\n# 显示图形\nplt.show()\n------\n报错为:\nNameError: name 'plt' is not defined",
      });
    };

    return (
      <div ref={ref} className="libro-error-container">
        <div className="libro-text-render-container">
          <div className="libro-error-label libro-text-render">
            <pre>
              <span className="ansi-red-fg">{source.ename}</span>
              {': ' + source.evalue}
            </pre>
            <div className="libro-error-output-btn-container">
              <Button
                className="libro-ai-native-fix-button"
                icon={<AIIcon />}
                onClick={handleFixWithAI}
              >
                Fix with AI
              </Button>
              <Button
                className="libro-show-error-detail-button"
                danger
                onClick={handleShowErrorDetail}
              >
                {output.showErrorDetail ? 'Hide' : 'Show'} error details
              </Button>
            </div>
          </div>
        </div>
        <div className="libro-text-render-container">
          <div
            className="libro-text-render"
            ref={streamRef}
            style={{ display: `${output.showErrorDetail ? 'block' : 'none'} ` }}
          />
        </div>
      </div>
    );
  },
);

@transient()
@view('libro-error-output-model')
export class AIErrorOutputModel extends ErrorOutputModel {
  override view = AIErrorOutputModelRender;
  @prop() showChat = false;
}
