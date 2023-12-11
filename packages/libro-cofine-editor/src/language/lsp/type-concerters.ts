import { languages } from '@difizen/monaco-editor-core';
import * as lsp from 'vscode-languageserver-protocol';

const _from = new Map<lsp.CompletionItemKind, languages.CompletionItemKind>([
  [lsp.CompletionItemKind.Method, languages.CompletionItemKind.Method],
  [lsp.CompletionItemKind.Function, languages.CompletionItemKind.Function],
  [lsp.CompletionItemKind.Constructor, languages.CompletionItemKind.Constructor],
  [lsp.CompletionItemKind.Field, languages.CompletionItemKind.Field],
  [lsp.CompletionItemKind.Variable, languages.CompletionItemKind.Variable],
  [lsp.CompletionItemKind.Class, languages.CompletionItemKind.Class],
  [lsp.CompletionItemKind.Interface, languages.CompletionItemKind.Interface],
  [lsp.CompletionItemKind.Struct, languages.CompletionItemKind.Struct],
  [lsp.CompletionItemKind.Module, languages.CompletionItemKind.Module],
  [lsp.CompletionItemKind.Property, languages.CompletionItemKind.Property],
  [lsp.CompletionItemKind.Unit, languages.CompletionItemKind.Unit],
  [lsp.CompletionItemKind.Value, languages.CompletionItemKind.Value],
  [lsp.CompletionItemKind.Constant, languages.CompletionItemKind.Constant],
  [lsp.CompletionItemKind.Enum, languages.CompletionItemKind.Enum],
  [lsp.CompletionItemKind.EnumMember, languages.CompletionItemKind.EnumMember],
  [lsp.CompletionItemKind.Keyword, languages.CompletionItemKind.Keyword],
  [lsp.CompletionItemKind.Snippet, languages.CompletionItemKind.Snippet],
  [lsp.CompletionItemKind.Text, languages.CompletionItemKind.Text],
  [lsp.CompletionItemKind.Color, languages.CompletionItemKind.Color],
  [lsp.CompletionItemKind.File, languages.CompletionItemKind.File],
  [lsp.CompletionItemKind.Reference, languages.CompletionItemKind.Reference],
  [lsp.CompletionItemKind.Folder, languages.CompletionItemKind.Folder],
  [lsp.CompletionItemKind.Event, languages.CompletionItemKind.Event],
  [lsp.CompletionItemKind.Operator, languages.CompletionItemKind.Operator],
  [lsp.CompletionItemKind.TypeParameter, languages.CompletionItemKind.TypeParameter],
  // [lsp.CompletionItemKind.Issue, languages.CompletionItemKind.Issue],
  // [lsp.CompletionItemKind.User, languages.CompletionItemKind.User],
]);

const _to = new Map<languages.CompletionItemKind, lsp.CompletionItemKind>([
  [languages.CompletionItemKind.Method, lsp.CompletionItemKind.Method],
  [languages.CompletionItemKind.Function, lsp.CompletionItemKind.Function],
  [languages.CompletionItemKind.Constructor, lsp.CompletionItemKind.Constructor],
  [languages.CompletionItemKind.Field, lsp.CompletionItemKind.Field],
  [languages.CompletionItemKind.Variable, lsp.CompletionItemKind.Variable],
  [languages.CompletionItemKind.Class, lsp.CompletionItemKind.Class],
  [languages.CompletionItemKind.Interface, lsp.CompletionItemKind.Interface],
  [languages.CompletionItemKind.Struct, lsp.CompletionItemKind.Struct],
  [languages.CompletionItemKind.Module, lsp.CompletionItemKind.Module],
  [languages.CompletionItemKind.Property, lsp.CompletionItemKind.Property],
  [languages.CompletionItemKind.Unit, lsp.CompletionItemKind.Unit],
  [languages.CompletionItemKind.Value, lsp.CompletionItemKind.Value],
  [languages.CompletionItemKind.Constant, lsp.CompletionItemKind.Constant],
  [languages.CompletionItemKind.Enum, lsp.CompletionItemKind.Enum],
  [languages.CompletionItemKind.EnumMember, lsp.CompletionItemKind.EnumMember],
  [languages.CompletionItemKind.Keyword, lsp.CompletionItemKind.Keyword],
  [languages.CompletionItemKind.Snippet, lsp.CompletionItemKind.Snippet],
  [languages.CompletionItemKind.Text, lsp.CompletionItemKind.Text],
  [languages.CompletionItemKind.Color, lsp.CompletionItemKind.Color],
  [languages.CompletionItemKind.File, lsp.CompletionItemKind.File],
  [languages.CompletionItemKind.Reference, lsp.CompletionItemKind.Reference],
  [languages.CompletionItemKind.Folder, lsp.CompletionItemKind.Folder],
  [languages.CompletionItemKind.Event, lsp.CompletionItemKind.Event],
  [languages.CompletionItemKind.Operator, lsp.CompletionItemKind.Operator],
  [languages.CompletionItemKind.TypeParameter, lsp.CompletionItemKind.TypeParameter],
  // [languages.CompletionItemKind.User, lsp.CompletionItemKind.User],
  // [languages.CompletionItemKind.Issue, lsp.CompletionItemKind.Issue],
]);

export class CompletionItemKind {
  static from(kind: lsp.CompletionItemKind): languages.CompletionItemKind {
    return _from.get(kind) ?? languages.CompletionItemKind.Property;
  }

  static to(kind: languages.CompletionItemKind): lsp.CompletionItemKind {
    return _to.get(kind) ?? lsp.CompletionItemKind.Property;
  }
}
