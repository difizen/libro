import type { CodeMirrorEditor } from '@difizen/libro-codemirror';
import { LibroSearchModule } from '@difizen/libro-search';
import { ManaModule } from '@difizen/mana-app';

import { CodeMirrorCodeCellSearchProviderContribution } from './codemirror-code-cell-search-provider-contribution.js';
import { CodeMirrorCodeCellSearchProvider } from './codemirror-code-cell-search-provider.js';
import { CodeMirrorSearchHighlighter } from './codemirror-search-highlighter.js';
import {
  CodeMirrorCodeCellSearchOption,
  CodeMirrorCodeCellSearchProviderFactory,
  CodeMirrorSearchHighlighterFactory,
} from './codemirror-search-protocol.js';

export const SearchCodemirrorCellModule = ManaModule.create()
  .register(
    CodeMirrorCodeCellSearchProvider,
    CodeMirrorSearchHighlighter,
    CodeMirrorCodeCellSearchProviderContribution,
    {
      token: CodeMirrorSearchHighlighterFactory,
      useFactory: (ctx) => {
        return (editor: CodeMirrorEditor) => {
          const child = ctx.container.createChild();
          const highlighter = child.get(CodeMirrorSearchHighlighter);
          highlighter.setEditor(editor);
          return highlighter;
        };
      },
    },
    {
      token: CodeMirrorCodeCellSearchProviderFactory,
      useFactory: (ctx) => {
        return (options: CodeMirrorCodeCellSearchOption) => {
          const child = ctx.container.createChild();
          child.register({
            token: CodeMirrorCodeCellSearchOption,
            useValue: options,
          });
          const model = child.get(CodeMirrorCodeCellSearchProvider);
          return model;
        };
      },
    },
  )
  .dependOn(LibroSearchModule);
