/* eslint-disable @typescript-eslint/no-unused-vars */

import type { DefaultEncodedFormatter } from '@difizen/libro-jupyter';
import {
  concatMultilineString,
  DefaultDecodedFormatter,
  FormatterContribution,
} from '@difizen/libro-jupyter';
import { singleton } from '@difizen/mana-app';

export interface PromptDecodedFormatter extends DefaultDecodedFormatter {
  modelType?: string;
  variableName?: string;
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
    const promptObj = {
      model_name: source.modelType || 'chatgpt',
      prompt: source.value,
      variable_name: source.variableName,
    };
    const encodeValue = `%%prompt \n${JSON.stringify(promptObj)}`;
    return {
      source: encodeValue,
      metadata: {
        libroFormatter: this.formatter,
      },
    };
  };

  decode = (formatterValue: DefaultEncodedFormatter) => {
    const value = concatMultilineString(formatterValue.source);
    if (value.startsWith('%%prompt \n')) {
      const run = value.split('%%prompt \n')[1];
      const runValue = JSON.parse(run);
      const codeValue = runValue.prompt;
      const modelType = runValue.model_name;
      const variableName = runValue.variable_name;
      return {
        value: codeValue,
        variableName,
        modelType,
      };
    }
    return {
      value: '',
    };
  };

  validate = (source: PromptDecodedFormatter): source is PromptDecodedFormatter => {
    return DefaultDecodedFormatter.is(source) && 'modelType' in source;
  };
}
