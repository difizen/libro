import { singleton } from '@difizen/libro-common/app';

@singleton()
export class PromptScript {
  public readonly getChatObjects: string = `from libro_ai import chat_object_manager
chat_object_manager.dump_kernel_list_json()`;
  public readonly getChatRecoreds: string = `from libro_ai import chat_record_provider
chat_record_provider.get_records()`;
  switchInterpreterMode = (key: string, mode: boolean) => {
    return `from libro_ai import chat_object_manager\nexecutor = chat_object_manager.get_executor('${key}')\nexecutor.set_interpreter_support(${mode ? 'True' : 'False'})`;
  };
}
