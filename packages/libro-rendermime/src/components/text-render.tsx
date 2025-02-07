import type { JSONValue } from '@difizen/libro-common';
import { concatMultilineString } from '@difizen/libro-common';
import type { BaseOutputView } from '@difizen/libro-core';
import { useInject } from '@difizen/libro-common/app';
import React, { useEffect, useRef } from 'react';

import { renderText } from '../renderers.js';
import type { IRenderMimeRegistry } from '../rendermime-protocol.js';
import { RenderMimeRegistry } from '../rendermime-registry.js';

export const RawTextRender: React.FC<{ model: BaseOutputView }> = (props: {
  model: BaseOutputView;
}) => {
  const { model } = props;
  const renderTextRef = useRef<HTMLDivElement>(null);
  const renderTextContainerRef = useRef<HTMLDivElement>(null);
  const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);

  const mimeType = defaultRenderMime.defaultPreferredMimeType(
    model,
    // model.trusted ? 'any' : 'ensure'
  );
  let dataContent: JSONValue | null = null;
  if (mimeType) {
    dataContent = model.data[mimeType];
  }
  useEffect(() => {
    if (dataContent && mimeType) {
      renderText({
        host: renderTextRef.current as HTMLElement,
        source: concatMultilineString(JSON.parse(JSON.stringify(dataContent))),
        sanitizer: defaultRenderMime.sanitizer,
        mimeType: mimeType,
      });
      if (mimeType === 'application/vnd.jupyter.stderr') {
        renderTextContainerRef.current?.setAttribute(
          'data-mime-type',
          'application/vnd.jupyter.stderr',
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mimeType, dataContent]);
  return (
    <div className="libro-text-render-container" ref={renderTextContainerRef}>
      <div className="libro-text-render" ref={renderTextRef} />
    </div>
  );
};

export const TextRender = React.memo(RawTextRender);
