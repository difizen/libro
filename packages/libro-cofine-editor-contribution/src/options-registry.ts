import { singleton } from '@difizen/mana-app';

@singleton()
export class LanguageOptionsRegistry {
  protected optionsMap: Map<string, any> = new Map();

  registerOptions(key: string, data: any) {
    this.optionsMap.set(key, data);
  }

  getOptions(key: string): any {
    return this.optionsMap.get(key);
  }
}
