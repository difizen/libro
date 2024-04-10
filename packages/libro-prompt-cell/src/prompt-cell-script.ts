import { singleton } from '@difizen/mana-app';

@singleton()
export class PromptScript {
  public readonly getChatObjects: string = `from libro_ai import chat_object_manager
chat_object_manager.dump_list_json()`;
  public readonly getChatRecoreds: string = `from libro_ai import chat_record_provider
chat_record_provider.get_records()`;
}
