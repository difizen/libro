import { singleton } from '@difizen/mana-app';

@singleton()
export class PromptScript {
  public readonly toList = `from libro_server import chat_provider
chat_provider.dump_list_json()`;
}
