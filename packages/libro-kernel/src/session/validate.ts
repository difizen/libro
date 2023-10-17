import { validateModel as validateKernelModel } from '../kernel/validate.js';
import { validateProperty } from '../validate-property.js';

import type { SessionMeta } from './libro-session-protocol.js';

/**
 * Validate an `Session.IModel` object.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function validateModel(data: any): asserts data is SessionMeta {
  validateProperty(data, 'id', 'string');
  validateProperty(data, 'type', 'string');
  validateProperty(data, 'name', 'string');
  validateProperty(data, 'path', 'string');
  validateProperty(data, 'kernel', 'object');
  validateKernelModel(data.kernel);
}

/**
 * Update model from legacy session data.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function updateLegacySessionModel(data: any): void {
  if (data.path === undefined && data.notebook !== undefined) {
    data.path = data.notebook.path;
    data.type = 'notebook';
    data.name = '';
  }
}

/**
 * Validate an array of `Session.IModel` objects.
 */
export function validateModels(models: SessionMeta[]): asserts models is SessionMeta[] {
  if (!Array.isArray(models)) {
    throw new Error('Invalid session list');
  }
  models.forEach((d) => validateModel(d));
}
