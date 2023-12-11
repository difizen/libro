import type monaco from '@difizen/monaco-editor-core';

import { LangaugeFeatureProvider } from './language-feature-provider.js';

export class SignatureHelpProvider
  extends LangaugeFeatureProvider
  implements monaco.languages.SignatureHelpProvider
{
  signatureHelpTriggerCharacters: ['(', ',', ')'];
  signatureHelpRetriggerCharacters?: readonly string[] | undefined;
  provideSignatureHelp = async (
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    token: monaco.CancellationToken,
    context: monaco.languages.SignatureHelpContext,
  ): Promise<monaco.languages.SignatureHelpResult | undefined> => {
    const editor = this.getEditorByModel(model);
    if (!editor || editor.getOption('lspEnabled') !== true) {
      return;
    }
    const provider = await this.getProvider(model);
    if (!provider) {
      return;
    }

    const { lspConnection, editor: docEditor, virtualDocument: doc } = provider;

    const virtualPos = doc.transformEditorToVirtual(docEditor, {
      line: position.lineNumber - 1, // lsp is zero based, monaco is one based
      ch: position.column - 1,
      isEditor: true,
    });

    if (!virtualPos) {
      return;
    }

    const sigInfo = await lspConnection.clientRequests[
      'textDocument/signatureHelp'
    ].request({
      position: { line: virtualPos.line, character: virtualPos.ch },
      textDocument: {
        uri: doc.documentInfo.uri,
      },
    });

    return {
      value: {
        signatures: sigInfo.signatures.map((sig: any) => {
          return {
            label: sig.label,
            documentation: sig.documentation,
            parameters: sig.parameters ?? [],
            activeParameter: sig.activeParameter,
          };
        }),
        activeSignature: sigInfo.activeSignature ?? 0,
        activeParameter: sigInfo.activeParameter ?? 0,
      },
      dispose: () => {
        //
      },
    };
  };
}
