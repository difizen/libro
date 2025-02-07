import { concatMultilineString } from '@difizen/libro-common';
import type { BaseOutputView } from '@difizen/libro-core';
import { useInject } from '@difizen/libro-common/mana-app';
import React, { useEffect, useRef } from 'react';

import { renderMarkdown } from '../renderers.js';
import type { IRenderMimeRegistry } from '../rendermime-protocol.js';
import { RenderMimeRegistry } from '../rendermime-registry.js';

export const MarkdownRender: React.FC<{ model: BaseOutputView }> = (props: {
  model: BaseOutputView;
}) => {
  const { model } = props;
  const renderMarkdownRef = useRef<HTMLDivElement>(null);
  const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);

  const mimeType = defaultRenderMime.defaultPreferredMimeType(
    model,
    // model.trusted ? 'any' : 'ensure'
  );
  useEffect(() => {
    if (mimeType) {
      renderMarkdown({
        host: renderMarkdownRef.current as HTMLElement,
        source: concatMultilineString(JSON.parse(JSON.stringify(model.data[mimeType]))),
        trusted: model.trusted,
        resolver: defaultRenderMime.resolver,
        sanitizer: defaultRenderMime.sanitizer,
        linkHandler: defaultRenderMime.linkHandler,
        // shouldTypeset: options.isAttached,
        markdownParser: defaultRenderMime.markdownParser,
        cellId: model.cell.model.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="libro-markdown-render-container">
      <div className="libro-markdown-render" ref={renderMarkdownRef} />
    </div>
  );
};
