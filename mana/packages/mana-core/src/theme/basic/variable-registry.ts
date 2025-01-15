import type { Disposable } from '@difizen/mana-common';
import { singleton } from '@difizen/mana-syringe';

import { BaseVariableRegistry } from '../base-variable-registry';
import type { VariableDefinition } from '../protocol';

/**
 * It should be implemented by an extension, e.g. by the monaco extension.
 */
@singleton()
export class VariableRegistry extends BaseVariableRegistry {
  protected override get definitionList(): VariableDefinition<string>[] {
    return [...this.definitionMap.values()];
  }
  protected override definitionMap: Map<string, VariableDefinition<string>> = new Map();

  override register(...definitions: VariableDefinition<string>[]): Disposable {
    return super.register(...definitions);
  }

  protected override doRegister(definition: VariableDefinition<string>): Disposable {
    return super.doRegister(definition);
  }
}
