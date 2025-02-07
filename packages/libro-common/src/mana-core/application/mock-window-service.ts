import { Event } from '../../mana-common/index.js';
import { singleton } from '../../mana-syringe/index.js';

import type { WindowService } from './application-protocol';

@singleton()
export class MockWindowService implements WindowService {
  openNewWindow(): undefined {
    return undefined;
  }
  canUnload(): boolean {
    return true;
  }
  get onUnload(): Event<void> {
    return Event.None;
  }
}
