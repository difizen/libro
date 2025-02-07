import { concatMultilineString } from '@difizen/libro-common';
import type { BaseOutputView } from '@difizen/libro-core';
import { useInject } from '@difizen/libro-common/app';
import React, { useEffect, useRef } from 'react';

import { renderSVG } from '../renderers.js';
import type { IRenderMimeRegistry } from '../rendermime-protocol.js';
import { RenderMimeRegistry } from '../rendermime-registry.js';

export const SVGRender: React.FC<{ model: BaseOutputView }> = (props: {
  model: BaseOutputView;
}) => {
  const { model } = props;
  const renderSVGRef = useRef<HTMLDivElement>(null);
  const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);

  const mimeType = defaultRenderMime.defaultPreferredMimeType(
    model,
    // model.trusted ? 'any' : 'ensure'
  );
  useEffect(() => {
    if (mimeType) {
      renderSVG({
        host: renderSVGRef.current as HTMLElement,
        source: concatMultilineString(JSON.parse(JSON.stringify(model.data[mimeType]))),
        trusted: model.trusted,
        unconfined:
          model.metadata && (model.metadata['unconfined'] as boolean | undefined),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="libro-svg-render-container">
      <div className="libro-svg-render" ref={renderSVGRef} />
    </div>
  );
};
