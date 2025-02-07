/* eslint-disable @typescript-eslint/no-unused-vars */
import { singleton } from '@difizen/libro-common/mana-app';

import { ContentSaveContribution } from './libro-content-protocol.js';

@singleton({ contrib: ContentSaveContribution })
export class DefaultSaveContentContribution implements ContentSaveContribution {
  canHandle = (options: Record<string, any>, model: any) => 1;
  saveContent(options: Record<string, any>, model: any) {
    return Promise.resolve();
  }
}
