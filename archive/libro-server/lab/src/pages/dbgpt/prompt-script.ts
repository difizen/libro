import { singleton } from '@difizen/mana-app';
import { PromptScript } from '@difizen/libro-prompt-cell';

@singleton()
export class LibroPromptScript extends PromptScript {
  public override readonly getChatObjects = `from libro_ai import chat_object_manager
chat_object_manager.dump_kernel_list_json()` as any;
  public override readonly getChatRecoreds = `from libro_ai import chat_record_provider
chat_record_provider.get_records()` as any;
}
