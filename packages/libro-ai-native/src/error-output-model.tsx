import type { IError, IRenderMimeRegistry } from '@difizen/libro-jupyter';
import {
  ErrorOutputModel,
  defaultSanitizer,
  LibroSlotManager,
  LibroSlotView,
  RenderMimeRegistry,
  renderText,
} from '@difizen/libro-jupyter';
import { prop, transient } from '@difizen/mana-app';
import { getOrigin, useInject, view, ViewInstance } from '@difizen/mana-app';
import { Button } from 'antd';
import { forwardRef, createRef, useEffect } from 'react';
import './index.less';

import { LibroAIChatSlotContribution } from './chat-slot-contribution.js';
import { AIIcon } from './icon.js';

const AIErrorOutputModelRender = forwardRef<HTMLDivElement>(
  function ErrorOutputModelRender(_props, ref) {
    const output = useInject<AIErrorOutputModel>(ViewInstance);
    const chatSlotContribution = useInject<LibroAIChatSlotContribution>(
      LibroAIChatSlotContribution,
    );
    const libroSlotManager = useInject<LibroSlotManager>(LibroSlotManager);
    const model = getOrigin(output);
    const source = getOrigin(output).raw as IError;
    const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);
    const traceback = source.traceback.join('\n');
    const defaultRenderMimeType = defaultRenderMime.preferredMimeType(model);
    const streamRef = createRef<HTMLDivElement>();
    const libro = output.cell.parent;

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

    const handleShowAIChat = async () => {
      const chatView = chatSlotContribution.viewMap.get(output.cell.parent.id);
      output.showChat = !output.showChat;
      if (chatView) {
        if (output.showChat) {
          libroSlotManager.slotViewManager.addView(
            chatView,
            libroSlotManager.getSlotName(libro, chatSlotContribution.slot),
            {
              reveal: true,
              order: 'a',
            },
          );
        } else {
          const slotview = libroSlotManager.slotViewManager.getSlotView(
            libroSlotManager.getSlotName(output.cell.parent, 'right'),
          );
          if (slotview instanceof LibroSlotView) {
            slotview.revertActive();
          }
        }
      }
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
                onClick={handleShowAIChat}
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
