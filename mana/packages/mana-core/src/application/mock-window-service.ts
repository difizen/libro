import { Event } from '@difizen/mana-common';
import { singleton } from '@difizen/mana-syringe';

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
