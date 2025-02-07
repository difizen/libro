import { getOrigin } from '@difizen/mana-observable';
import { singleton } from '@difizen/mana-syringe';
import Ajv from 'ajv';

import type { ConfigurationNode } from './configuration-protocol';

@singleton()
export class SchemaValidator {
  protected ajvInstance = new Ajv();

  /**
   * https://ajv.js.org/guide/managing-schemas.html#using-ajv-instance-cache
   */
  addSchema<T>(node: ConfigurationNode<T>) {
    getOrigin(this.ajvInstance).addSchema(node.schema, node.id);
  }

  getSchema<T>(node: ConfigurationNode<T>) {
    return getOrigin(this.ajvInstance).getSchema<T>(node.id);
  }

  validateNode<T = any>(node: ConfigurationNode<T>, value: T): boolean {
    const validate = this.getSchema(node);
    if (validate === undefined) {
      return false;
    }
    const valid = validate(value) as boolean;
    if (!valid) {
      console.warn(validate.errors);
    }
    return valid;
  }
}
