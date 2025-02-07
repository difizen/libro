import type { IError, IRenderMimeRegistry } from '@difizen/libro-jupyter';
import { concatMultilineString } from '@difizen/libro-jupyter';
import {
  ErrorOutputModel,
  defaultSanitizer,
  RenderMimeRegistry,
  renderText,
} from '@difizen/libro-jupyter';
import { prop, transient } from '@difizen/libro-common/app';
import { getOrigin, useInject, view, ViewInstance } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';
import { Button } from 'antd';
import { forwardRef, createRef, useEffect } from 'react';

import './index.less';
import { LibroAINativeService } from './ai-native-service.js';
import { AIIcon } from './icon.js';
import { addCellAIClassname } from './utils.js';

const AIErrorOutputModelRender = forwardRef<HTMLDivElement>(
  function ErrorOutputModelRender(_props, ref) {
    const output = useInject<AIErrorOutputModel>(ViewInstance);
    const model = getOrigin(output);
    const source = getOrigin(output).raw as IError;
    const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);
    const traceback = source.traceback.join('\n');
    const defaultRenderMimeType = defaultRenderMime.preferredMimeType(model);
    const streamRef = createRef<HTMLDivElement>();
    const libroAINativeService = useInject<LibroAINativeService>(LibroAINativeService);

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
      const libroAINativeForCellView =
        await libroAINativeService.getOrCreateLibroAINativeForCellView(
          output.cell.id,
          getOrigin(output.cell),
        );
      addCellAIClassname(output.cell);
      libroAINativeForCellView.showAI = true;
      const code =
        l10n.getLang() === 'en-US'
          ? `Code is:\n${output.cell.model.value}\nError trackback is:\n${concatMultilineString(source.traceback)}`
          : `代码为:\n${output.cell.model.value}\n报错为:\n${concatMultilineString(source.traceback)}`;
      libroAINativeForCellView.chatStream({
        chat_key: 'LLM:debug',
        content: code,
        language: l10n.getLang(),
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
