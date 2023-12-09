// import { l10n } from '@difizen/mana-l10n';
import type { IOutputAreaOption } from '@difizen/libro-core';
import { LibroOutputArea } from '@difizen/libro-core';
import type { IRenderMimeRegistry } from '@difizen/libro-jupyter';
import { RenderMimeRegistry } from '@difizen/libro-jupyter';
import type { ViewComponent } from '@difizen/mana-app';
import {
  useInject,
  ViewInstance,
  ViewRender,
  prop,
  view,
  inject,
  transient,
  ViewOption,
} from '@difizen/mana-app';
import React from 'react';

import './index.less';

export const LibroPromptOutputAreaRender = React.forwardRef<HTMLDivElement>(
  function LibroPromptOutputAreaRender(_props, ref) {
    const outputArea = useInject<LibroPromptOutputArea>(ViewInstance);
    const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);

    return (
      <div className="libro-output-area prompt-cell" ref={ref}>
        {outputArea.outputs.map((output) => {
          if (
            defaultRenderMime.preferredMimeType(output) !==
            'application/vnd.libro.prompt+json'
          ) {
            return <ViewRender view={output} key={output.id} />;
          } else {
            return null;
          }
        })}
      </div>
    );
  },
);

@transient()
@view('libro-prompt-output-area')
export class LibroPromptOutputArea extends LibroOutputArea {
  override view: ViewComponent = LibroPromptOutputAreaRender;
  @prop()
  promptExecutionTipVisiable = false;
  @prop()
  promptExecutionTipShown = true;

  constructor(@inject(ViewOption) option: IOutputAreaOption) {
    super(option);
  }

  setSqlExecutionTipVisiable = (value: boolean) => {
    this.promptExecutionTipVisiable = value;
  };
}
