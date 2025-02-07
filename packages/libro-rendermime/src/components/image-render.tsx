import type { JSONObject } from '@difizen/libro-common';
import { concatMultilineString } from '@difizen/libro-common';
import type { BaseOutputView } from '@difizen/libro-core';
import { useInject } from '@difizen/libro-common/app';
import React, { useEffect, useRef } from 'react';

import { renderImage } from '../renderers.js';
import type { IRenderMimeRegistry } from '../rendermime-protocol.js';
import { RenderMimeRegistry } from '../rendermime-registry.js';

export const ImageRender: React.FC<{ model: BaseOutputView }> = (props: {
  model: BaseOutputView;
}) => {
  const { model } = props;
  const renderImageRef = useRef<HTMLDivElement>(null);
  const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);
  const mimeType = defaultRenderMime.defaultPreferredMimeType(
    model,
    // model.trusted ? 'any' : 'ensure'
  );
  useEffect(() => {
    if (mimeType) {
      renderImage({
        host: renderImageRef.current as HTMLElement,
        source: concatMultilineString(JSON.parse(JSON.stringify(model.data[mimeType]))),
        width: (model.metadata['width'] ||
          (model.metadata[mimeType] as JSONObject)?.['width']) as unknown as
          | number
          | undefined,
        height: (model.metadata['height'] ||
          (model.metadata[mimeType] as JSONObject)?.['height']) as unknown as
          | number
          | undefined,
        needsBackground: model.metadata['needs_background'] as string | undefined,
        unconfined:
          model.metadata && (model.metadata['unconfined'] as boolean | undefined),
        mimeType: mimeType,
      });
    }
  }, [mimeType, model.data, model.metadata, renderImageRef]);
  return (
    <div className="libro-image-render-container">
      <div className="libro-image-render" ref={renderImageRef} />
    </div>
  );
};
