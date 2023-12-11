/* eslint-disable @typescript-eslint/no-unused-vars */
import type monaco from '@difizen/monaco-editor-core';

import { LangaugeFeatureProvider } from './language-feature-provider.js';

export class SemanticHighlightProvider
  extends LangaugeFeatureProvider
  implements monaco.languages.DocumentSemanticTokensProvider
{
  onDidChange?: monaco.IEvent<void> | undefined;
  getLegend(): monaco.languages.SemanticTokensLegend {
    throw new Error('Method not implemented.');
  }
  provideDocumentSemanticTokens(
    model: monaco.editor.ITextModel,
    lastResultId: string | null,
    token: monaco.CancellationToken,
  ): monaco.languages.ProviderResult<
    monaco.languages.SemanticTokens | monaco.languages.SemanticTokensEdits
  > {
    throw new Error('Method not implemented.');
  }
  releaseDocumentSemanticTokens(resultId: string | undefined): void {
    throw new Error('Method not implemented.');
  }
}
