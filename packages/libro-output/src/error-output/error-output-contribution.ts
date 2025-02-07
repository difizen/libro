import type { IOutput } from '@difizen/libro-common';
import type { IOutputOptions } from '@difizen/libro-core';
import { OutputContribution } from '@difizen/libro-core';
import { inject, singleton } from '@difizen/libro-common/app';
import { ViewManager } from '@difizen/libro-common/app';

import { ErrorOutputModel } from './error-output-model.js';

@singleton({ contrib: OutputContribution })
export class ErrorOutputContribution implements OutputContribution {
  @inject(ViewManager) viewManager: ViewManager;
  canHandle = (output: IOutput) => {
    if (output.output_type === 'error') {
      return 100;
    }
    return 1;
  };
  factory(output: IOutputOptions) {
    return this.viewManager.getOrCreateView(ErrorOutputModel, output);
  }
}
