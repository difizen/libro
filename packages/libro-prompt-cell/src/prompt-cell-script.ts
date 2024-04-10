import { singleton } from '@difizen/mana-app';

@singleton()
export class PromptScript {
  public readonly getChatObjects = `from libro_ai import chat_object_manager
chat_object_manager.dump_list_json()`;
  public readonly getChatRecoreds = `from libro_ai import chat_record_provider
chat_record_provider.get_records()`;
}
