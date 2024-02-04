declare module '@difizen/monaco-editor-core/esm/vs/editor/common/languageSelector.js' {
  function score(
    selector: LanguageSelector | undefined,
    candidateUri: URI,
    candidateLanguage: string,
    candidateIsSynchronized: boolean,
    candidateNotebookUri: URI | undefined,
    candidateNotebookType: string | undefined,
  ): number;
}
