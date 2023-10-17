import { validateProperty } from '../validate-property.js';

import type { IContentsCheckpointModel, IContentsModel } from './contents-protocol.js';

/**
 * Validate an `IContentsModel` object.
 */
export function validateContentsModel(
  model: IContentsModel,
): asserts model is IContentsModel {
  validateProperty(model, 'name', 'string');
  validateProperty(model, 'path', 'string');
  validateProperty(model, 'type', 'string');
  validateProperty(model, 'created', 'string');
  validateProperty(model, 'last_modified', 'string');
  validateProperty(model, 'mimetype', 'object');
  validateProperty(model, 'content', 'object');
  validateProperty(model, 'format', 'object');
}

/**
 * Validate an `IContentsCheckpointModel` object.
 */
export function validateCheckpointModel(
  model: IContentsCheckpointModel,
): asserts model is IContentsCheckpointModel {
  validateProperty(model, 'id', 'string');
  validateProperty(model, 'last_modified', 'string');
}
