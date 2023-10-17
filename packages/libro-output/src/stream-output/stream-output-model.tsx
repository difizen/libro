import type { JSONObject } from '@difizen/libro-common';
import { LibroOutputView } from '@difizen/libro-core';
import type { BaseOutputView, IOutputOptions } from '@difizen/libro-core';
import { RenderMimeRegistry } from '@difizen/libro-rendermime';
import type { IRenderMimeRegistry } from '@difizen/libro-rendermime';
import { inject, transient } from '@difizen/mana-app';
import {
  getOrigin,
  useInject,
  view,
  ViewInstance,
  ViewOption,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

import '../index.less';

import { getBundleOptions } from '../output-utils.js';

const StreamOutputModelRender = forwardRef<HTMLDivElement>(
  function StreamOutputModelRender(_props, ref) {
    const output = useInject<StreamOutputModel>(ViewInstance);
    const model = getOrigin(output);
    const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);
    const defaultRenderMimeType = defaultRenderMime.preferredMimeType(model);
    if (defaultRenderMimeType) {
      const OutputRender = defaultRenderMime.createRenderer(
        defaultRenderMimeType,
        model,
      );
      const children = <OutputRender model={model} />;
      return (
        <div ref={ref} className={'libro-stream-container'}>
          {children}
        </div>
      );
    } else {
      return null;
    }
  },
);
@transient()
@view('libro-stream-output-model')
export class StreamOutputModel extends LibroOutputView implements BaseOutputView {
  constructor(@inject(ViewOption) options: IOutputOptions) {
    super(options);
    const { data, metadata } = getBundleOptions(options.output);
    this.type = options.output.output_type;
    this.data = data as JSONObject;
    this.metadata = metadata;
  }
  override view = StreamOutputModelRender;
  override toJSON() {
    return {
      output_type: this.raw.output_type,
      name: this.raw.name,
      text: this.raw.text,
    };
  }
}
