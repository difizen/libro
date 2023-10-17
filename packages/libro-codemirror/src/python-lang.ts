import { pythonLanguage } from '@codemirror/lang-python';
import { LanguageSupport } from '@codemirror/language';

/// Python language support. 去掉了默认内置的代码提示
export function python() {
  return new LanguageSupport(pythonLanguage, []);
}
