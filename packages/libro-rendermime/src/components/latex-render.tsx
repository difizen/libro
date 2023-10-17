import { concatMultilineString } from '@difizen/libro-common';
import type { BaseOutputView } from '@difizen/libro-core';
import { useInject } from '@difizen/mana-app';
import React from 'react';

import type { IRenderMimeRegistry } from '../rendermime-protocol.js';
import { RenderMimeRegistry } from '../rendermime-registry.js';

export const LatexRender: React.FC<{ model: BaseOutputView }> = (props: {
  model: BaseOutputView;
}) => {
  const { model } = props;
  const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);

  const mimeType = defaultRenderMime.defaultPreferredMimeType(
    model,
    // model.trusted ? 'any' : 'ensure'
  );
  if (!mimeType) {
    return null;
  }

  return (
    <div className="libro-latex-render-container">
      <div className="libro-latex-render">
        {concatMultilineString(JSON.parse(JSON.stringify(model.data[mimeType])))}
      </div>
    </div>
  );
};
