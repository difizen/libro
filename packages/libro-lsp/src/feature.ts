// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import type { Event } from '@difizen/mana-app';
import { Emitter } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import mergeWith from 'lodash.mergewith';

import type { ClientCapabilities } from './lsp.js';
import type { IFeature } from './tokens.js';
import { ILSPFeatureManager } from './tokens.js';

/**
 * Class to manager the registered features of the language servers.
 */
@singleton({ token: ILSPFeatureManager })
export class FeatureManager implements ILSPFeatureManager {
  constructor() {
    this._featuresRegistered = new Emitter();
  }
  /**
   * List of registered features
   */
  readonly features: IFeature[] = [];

  /**
   * Signal emitted when a new feature is registered.
   */
  get featuresRegistered(): Event<IFeature> {
    return this._featuresRegistered.event;
  }

  /**
   * Register a new feature, skip if it is already registered.
   */
  register(feature: IFeature): void {
    if (this.features.some((ft) => ft.id === feature.id)) {
      console.warn(`Feature with id ${feature.id} is already registered, skipping.`);
    } else {
      this.features.push(feature);
      this._featuresRegistered.fire(feature);
    }
  }

  /**
   * Get the capabilities of all clients.
   */
  clientCapabilities(): ClientCapabilities {
    let capabilities: ClientCapabilities = {};
    for (const feature of this.features) {
      if (!feature.capabilities) {
        continue;
      }
      capabilities = mergeWith(capabilities, feature.capabilities);
    }
    return capabilities;
  }

  protected _featuresRegistered: Emitter<IFeature>;
}
