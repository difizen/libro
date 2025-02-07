import { singleton } from '@difizen/libro-common/mana-app';

import { ContentContribution } from './libro-content-protocol.js';

@singleton({ contrib: ContentContribution })
export class DefaultContentContribution implements ContentContribution {
  canHandle = (options: Record<string, any>, model: any) => 1;
  loadContent(options: Record<string, any>, model: any) {
    return Promise.resolve({
      metadata: {},
      cells: [],
      nbformat: 4,
      nbformat_minor: 4,
    });
  }
}
