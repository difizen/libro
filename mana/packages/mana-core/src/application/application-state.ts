import type { Event } from '@difizen/mana-common';
import { Emitter, Deferred } from '@difizen/mana-common';
import { prop } from '@difizen/mana-observable';
import { inject, singleton } from '@difizen/mana-syringe';

import { DebugService } from '../common/debug';

export enum ApplicationState {
  Default = 'Default',
  Initialized = 'Initialized',
  Started = 'Started',
  ViewStarted = 'ViewStarted',
  Ready = 'Ready',
  Closing = 'Closing',
}

@singleton()
export class ApplicationStateService {
  @prop()
  state: ApplicationState = ApplicationState.Default;

  protected readonly debugService: DebugService;

  constructor(
    @inject(DebugService)
    debugService: DebugService,
  ) {
    this.debugService = debugService;
  }

  protected deferred: Record<string, Deferred<void>> = {};
  protected readonly stateChanged = new Emitter<ApplicationState>();

  setState(state: ApplicationState) {
    if (state !== this.state) {
      const oldState = this.state;
      const oldDeferred = this.getStateDeferred(oldState);
      oldDeferred.resolve();
      const deferred = this.getStateDeferred(state);
      this.state = state;
      deferred.resolve();
      this.deferred[state].resolve();
      this.debugService(
        `Changed application state from '${oldState}' to '${this.state}'.`,
      );
    }
  }

  get onStateChanged(): Event<ApplicationState> {
    return this.stateChanged.event;
  }

  protected getStateDeferred(state: ApplicationState): Deferred<void> {
    let deferred = this.deferred[state];
    if (deferred === undefined) {
      deferred = new Deferred();
      this.deferred[state] = deferred;
    }
    return deferred;
  }

  reachedState(state: ApplicationState): Promise<void> {
    return this.getStateDeferred(state).promise;
  }

  reachedAnyState(...states: ApplicationState[]): Promise<void> {
    return Promise.race(states.map((s) => this.reachedState(s)));
  }
}
