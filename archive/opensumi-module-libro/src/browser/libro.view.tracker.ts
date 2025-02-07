import { Injectable } from '@opensumi/di';
import { action, makeObservable, observable } from 'mobx';

@Injectable({ multiple: true })
export class LibroTracker {
  constructor() {
    makeObservable(this);
  }

  @observable
  refreshTimer: number | undefined = undefined;

  @action
  refresh(refreshTimer: number | undefined) {
    this.refreshTimer = refreshTimer;
  }
}
