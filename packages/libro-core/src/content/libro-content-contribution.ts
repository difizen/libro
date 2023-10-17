/* eslint-disable @typescript-eslint/no-unused-vars */
import { singleton } from '@difizen/mana-app';

import { ContentContribution } from './libro-content-protocol.js';

@singleton({ contrib: ContentContribution })
export class DefaultContentContribution implements ContentContribution {
  canHandle = (_options: Record<string, any>, _model: any) => 1;
  loadContent(_options: Record<string, any>, _model: any) {
    return Promise.resolve({
      metadata: {},
      cells: [],
      nbformat: 4,
      nbformat_minor: 4,
    });
  }
}
