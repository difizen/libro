import type { IOutput } from '@difizen/libro-common';
import type { IOutputOptions } from '@difizen/libro-core';
import { OutputContribution } from '@difizen/libro-core';
import { inject, singleton } from '@difizen/mana-app';
import { ViewManager } from '@difizen/mana-app';

import { StreamOutputModel } from './stream-output-model.js';

@singleton({ contrib: OutputContribution })
export class StreamOutputContribution implements OutputContribution {
  @inject(ViewManager) viewManager: ViewManager;
  canHandle = (output: IOutput) => {
    if (output.output_type === 'stream') {
      return 100;
    }
    return 1;
  };
  factory(output: IOutputOptions) {
    return this.viewManager.getOrCreateView(StreamOutputModel, output);
  }
}
