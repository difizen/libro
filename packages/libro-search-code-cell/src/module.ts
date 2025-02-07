import type { IEditor } from '@difizen/libro-code-editor';
import { LibroSearchModule } from '@difizen/libro-search';
import { ManaModule } from '@difizen/libro-common/app';

import {
  CodeCellSearchOption,
  CodeCellSearchProviderFactory,
  CodeEditorSearchHighlighterFactory,
} from './code-cell-search-protocol.js';
import { CodeCellSearchProviderContribution } from './code-cell-search-provider-contribution.js';
import { CodeCellSearchProvider } from './code-cell-search-provider.js';
import { GenericSearchHighlighter } from './search-highlighter.js';

export const SearchCodeCellModule = ManaModule.create()
  .register(
    CodeCellSearchProvider,
    CodeCellSearchProviderContribution,
    CodeCellSearchProviderFactory,
    GenericSearchHighlighter,
    {
      token: CodeEditorSearchHighlighterFactory,
      useFactory: (ctx) => {
        return (editor: IEditor) => {
          const child = ctx.container.createChild();
          const highlighter = child.get(GenericSearchHighlighter);
          highlighter.setEditor(editor);
          return highlighter;
        };
      },
    },
    {
      token: CodeCellSearchProviderFactory,
      useFactory: (ctx) => {
        return (options: CodeCellSearchOption) => {
          const child = ctx.container.createChild();
          child.register({
            token: CodeCellSearchOption,
            useValue: options,
          });
          const model = child.get(CodeCellSearchProvider);
          return model;
        };
      },
    },
  )
  .dependOn(LibroSearchModule);
