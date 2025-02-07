import { Syringe } from '@difizen/libro-common/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import type { TextmateRegistry } from './textmate-registry.js';

export const LanguageGrammarDefinitionContribution = Syringe.defineToken(
  'LanguageGrammarDefinitionContribution',
);
export interface LanguageGrammarDefinitionContribution {
  registerTextmateLanguage: (registry: TextmateRegistry) => void;
  _finishRegisterTextmateLanguage?: boolean;
}
export function getEncodedLanguageId(languageId: string): number {
  return monaco.languages.getEncodedLanguageId(languageId);
}
