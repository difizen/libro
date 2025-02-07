/* eslint-disable @typescript-eslint/no-unused-vars */

import type { DefaultEncodedFormatter } from '@difizen/libro-jupyter';
import {
  concatMultilineString,
  DefaultDecodedFormatter,
  FormatterContribution,
} from '@difizen/libro-jupyter';
import { singleton } from '@difizen/libro-common/mana-app';

export interface PromptDecodedFormatter extends DefaultDecodedFormatter {
  modelType?: string;
  chatKey?: string;
  variableName?: string;
  cellId?: string;
  record?: string;
  interpreterCode?: string;
  supportInterpreter?: 'dynamic' | 'immutable' | 'disable';
  interpreterEnabled?: boolean;
}

@singleton({ contrib: FormatterContribution })
export class FormatterPromptMagicContribution
  implements FormatterContribution<PromptDecodedFormatter>
{
  formatter = 'formatter-prompt-magic';
  formatterOptions?: object;
  canHandle = (libroFormatter: string) => {
    if (libroFormatter === this.formatter) {
      return 100;
    }
    return 1;
  };

  encode = (source: PromptDecodedFormatter) => {
    const chat_key = source.chatKey || source.modelType || 'LLM:chatgpt';
    const promptObj = {
      model_name: chat_key,
      chat_key: chat_key,
      prompt: source.value,
      variable_name: source.variableName,
      cell_id: source.cellId,
      record: source.record,
    };
    const encodeValue = `%%prompt \n${JSON.stringify(promptObj)}`;
    return {
      source: encodeValue,
      metadata: {
        libroFormatter: this.formatter,
        interpreter: {
          interpreter_code: source.interpreterCode,
          support_interpreter: source.supportInterpreter,
          interpreter_enabled: source.interpreterEnabled,
        },
      },
    };
  };

  decode = (formatterValue: DefaultEncodedFormatter) => {
    const value = concatMultilineString(formatterValue.source);
    if (value.startsWith('%%prompt \n')) {
      const run = value.split('%%prompt \n')[1];
      const runValue = JSON.parse(run);
      const codeValue = runValue.prompt;
      let interpreterCode;
      let supportInterpreter;
      let interpreterEnabled;
      if (formatterValue.metadata['interpreter']) {
        interpreterCode = formatterValue.metadata['interpreter']['interpreter_code'];
        supportInterpreter =
          formatterValue.metadata['interpreter']['support_interpreter'];
        interpreterEnabled =
          formatterValue.metadata['interpreter']['interpreter_enabled'];
      }
      const chatKey = runValue.chat_key || runValue.model_name;
      const variableName = runValue.variable_name;
      const cellId = runValue.cell_id;
      const record = runValue.record;
      return {
        value: codeValue,
        variableName,
        chatKey,
        cellId,
        record,
        interpreterCode,
        supportInterpreter,
        interpreterEnabled,
      };
    }
    return {
      value: '',
    };
  };

  validate = (source: PromptDecodedFormatter): source is PromptDecodedFormatter => {
    return (
      DefaultDecodedFormatter.is(source) &&
      ('chatKey' in source || 'modelType ' in source)
    );
  };
}
