import type { JSONObject } from '@difizen/libro-common';
import { LibroOutputView } from '@difizen/libro-core';
import type { BaseOutputView, IOutputOptions } from '@difizen/libro-core';
import { RenderMimeRegistry } from '@difizen/libro-rendermime';
import type { IRenderMimeRegistry } from '@difizen/libro-rendermime';
import {
  getOrigin,
  useInject,
  view,
  ViewInstance,
  ViewOption,
} from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import { forwardRef } from 'react';

import { getBundleOptions } from '../output-utils.js';
import '../index.less';

const DisplayDataOutputModelRender = forwardRef<HTMLDivElement>(
  function DisplayDataOutputModelRender(_props, ref) {
    const output = useInject<DisplayDataOutputModel>(ViewInstance);
    const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);

    const model = getOrigin(output);
    const defaultRenderMimeType = defaultRenderMime.preferredMimeType(model);
    let children = null;
    if (defaultRenderMimeType) {
      const OutputRender = defaultRenderMime.createRenderer(
        defaultRenderMimeType,
        model,
      );
      children = <OutputRender model={model} />;
    }
    return (
      <div ref={ref} className={'libro-display-data-container'}>
        {children}
      </div>
    );
  },
);
@transient()
@view('libro-display-data-output-model')
export class DisplayDataOutputModel extends LibroOutputView implements BaseOutputView {
  constructor(@inject(ViewOption) options: IOutputOptions) {
    super(options);
    const { data, metadata } = getBundleOptions(options.output);
    this.type = options.output.output_type;
    this.data = data as JSONObject;
    this.metadata = metadata;
  }
  override view = DisplayDataOutputModelRender;
  override toJSON() {
    if (this.raw.execution_count !== undefined) {
      return {
        output_type: this.raw.output_type,
        data: this.raw.data,
        metadata: this.raw.metadata,
        execution_count: this.raw.execution_count,
      };
    }
    return {
      output_type: this.raw.output_type,
      data: this.raw.data,
      metadata: this.raw.metadata,
    };
  }
}
