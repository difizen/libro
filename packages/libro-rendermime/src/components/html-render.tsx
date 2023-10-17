import { concatMultilineString } from '@difizen/libro-common';
import type { BaseOutputView } from '@difizen/libro-core';
import { useInject } from '@difizen/mana-app';
import React, { useEffect, useRef } from 'react';

import { renderHTML } from '../renderers.js';
import type { IRenderMimeRegistry } from '../rendermime-protocol.js';
import { RenderMimeRegistry } from '../rendermime-registry.js';

export const HTMLRender: React.FC<{ model: BaseOutputView }> = (props: {
  model: BaseOutputView;
}) => {
  const { model } = props;
  const renderHTMLRef = useRef<HTMLDivElement>(null);
  const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);

  const mimeType = defaultRenderMime.defaultPreferredMimeType(
    model,
    // model.trusted ? 'any' : 'ensure'
  );
  useEffect(() => {
    if (mimeType) {
      renderHTML({
        host: renderHTMLRef.current as HTMLElement,
        source: concatMultilineString(JSON.parse(JSON.stringify(model.data[mimeType]))),
        trusted: model.trusted,
        resolver: defaultRenderMime.resolver,
        sanitizer: defaultRenderMime.sanitizer,
        linkHandler: defaultRenderMime.linkHandler,
        shouldTypeset: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="libro-html-render-container">
      <div className="libro-html-common-render">
        <div className="libro-html-render" ref={renderHTMLRef} />
      </div>
    </div>
  );
};
