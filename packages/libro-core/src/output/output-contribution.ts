import { ViewManager } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

import { LibroOutputView } from './output-model.js';
import type { IOutputOptions } from './output-protocol.js';
import { OutputContribution } from './output-protocol.js';

@singleton({ contrib: OutputContribution })
export class DefaultOutputContribution implements OutputContribution {
  viewManager: ViewManager;
  constructor(@inject(ViewManager) viewManager: ViewManager) {
    this.viewManager = viewManager;
  }
  canHandle = () => 1;
  factory(output: IOutputOptions) {
    return this.viewManager.getOrCreateView(LibroOutputView, output);
  }
}
