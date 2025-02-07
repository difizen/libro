/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SearchMatch } from '@difizen/libro-code-editor';
import type { GenericSearchProvider, SearchFilters } from '@difizen/libro-search';
import { GenericSearchProviderFactory } from '@difizen/libro-search';
import { inject, prop, transient, watch } from '@difizen/libro-common/app';

import {
  CodeCellSearchOption,
  CodeEditorSearchHighlighterFactory,
} from './code-cell-search-protocol.js';
import { CodeEditorCellSearchProvider } from './code-editor-cell-search-provider.js';

@transient()
export class CodeCellSearchProvider extends CodeEditorCellSearchProvider {
  protected genericSearchProviderFactory: GenericSearchProviderFactory;
  @prop() protected outputsProvider: GenericSearchProvider[];
  @prop() protected currentProviderIndex: number;
  /**
   * Constructor
   *
   * @param cell Cell widget
   */
  constructor(
    @inject(CodeEditorSearchHighlighterFactory)
    highlighterFactory: CodeEditorSearchHighlighterFactory,
    @inject(GenericSearchProviderFactory)
    genericSearchProviderFactory: GenericSearchProviderFactory,
    @inject(CodeCellSearchOption) option: CodeCellSearchOption,
  ) {
    super(highlighterFactory, option.cell);
    this.genericSearchProviderFactory = genericSearchProviderFactory;
    this.currentProviderIndex = -1;
    this.outputsProvider = [];
    this.setupOutputProvider();
    this.toDispose.push(
      this.cell.outputArea.onUpdate(() => {
        this.setupOutputProvider();
      }),
    );

    this.toDispose.push(
      watch(this.cell.model, 'hasOutputHidden', async () => {
        await this.refresh();
      }),
    );
    this.toDispose.push(
      watch(this.cell, 'hasInputHidden', async () => {
        await this.refresh();
      }),
    );
  }

  /**
   * Number of matches in the cell.
   */
  override get matchesCount(): number {
    if (!this.isActive) {
      return 0;
    }

    return (
      super.matchesCount +
      this.outputsProvider.reduce(
        (sum, provider) => sum + (provider.matchesCount ?? 0),
        0,
      )
    );
  }

  /**
   * Clear currently highlighted match.
   */
  override async clearHighlight(): Promise<void> {
    await super.clearHighlight();
    await Promise.all(
      this.outputsProvider.map((provider) => provider.clearHighlight()),
    );
  }

  /**
   * Dispose the search provider
   */
  override dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this.outputsProvider.map((provider) => {
      provider.dispose();
    });
    this.outputsProvider.length = 0;
  }

  /**
   * Highlight the next match.
   *
   * @returns The next match if there is one.
   */
  override async highlightNext(): Promise<SearchMatch | undefined> {
    if (this.matchesCount === 0 || !this.isActive) {
      this.currentIndex = undefined;
    } else {
      if (this.currentProviderIndex === -1) {
        const match = await super.highlightNext();
        if (match) {
          this.currentIndex = this.editorHighlighter.currentIndex;
          return match;
        } else {
          this.currentProviderIndex = 0;
        }
      }

      while (this.currentProviderIndex < this.outputsProvider.length) {
        const provider = this.outputsProvider[this.currentProviderIndex];
        const match = await provider.highlightNext(false);
        if (match) {
          this.currentIndex =
            super.matchesCount +
            this.outputsProvider
              .slice(0, this.currentProviderIndex)
              .reduce((sum, p) => (sum += p.matchesCount ?? 0), 0) +
            provider.currentMatchIndex!;
          return match;
        } else {
          this.currentProviderIndex += 1;
        }
      }

      this.currentProviderIndex = -1;
      this.currentIndex = undefined;
      return undefined;
    }
    return;
  }

  /**
   * Highlight the previous match.
   *
   * @returns The previous match if there is one.
   */
  override async highlightPrevious(): Promise<SearchMatch | undefined> {
    if (this.matchesCount === 0 || !this.isActive) {
      this.currentIndex = undefined;
    } else {
      if (this.currentIndex === undefined) {
        this.currentProviderIndex = this.outputsProvider.length - 1;
      }

      while (this.currentProviderIndex >= 0) {
        const provider = this.outputsProvider[this.currentProviderIndex];

        const match = await provider.highlightPrevious(false);
        if (match) {
          this.currentIndex =
            super.matchesCount +
            this.outputsProvider
              .slice(0, this.currentProviderIndex)
              .reduce((sum, p) => (sum += p.matchesCount ?? 0), 0) +
            provider.currentMatchIndex!;
          return match;
        } else {
          this.currentProviderIndex -= 1;
        }
      }

      const match = await super.highlightPrevious();
      if (match) {
        this.currentIndex = this.editorHighlighter.currentIndex;
        return match;
      } else {
        this.currentIndex = undefined;
        return undefined;
      }
    }
    return;
  }

  /**
   * Initialize the search using the provided options. Should update the UI to highlight
   * all matches and "select" the first match.
   *
   * @param query A RegExp to be use to perform the search
   * @param filters Filter parameters to pass to provider
   */
  override async startQuery(
    query: RegExp | null,
    filters?: SearchFilters,
  ): Promise<void> {
    await super.startQuery(query, filters);
    // Search outputs
    if (filters?.searchCellOutput) {
      await Promise.all(
        this.outputsProvider.map((provider) => {
          provider.startQuery(query, this.filters);
        }),
      );
    }
  }

  override async endQuery(): Promise<void> {
    await super.endQuery();
    if (this.filters?.searchCellOutput !== false && this.isActive) {
      await Promise.all(this.outputsProvider.map((provider) => provider.endQuery()));
    }
  }

  async refresh() {
    await this.endQuery();
    await this.clearHighlight();
    await this.startQuery(this.query, this.filters);
  }

  protected setupOutputProvider = async () => {
    this.outputsProvider.forEach((provider) => {
      provider.dispose();
    });
    this.outputsProvider.length = 0;

    this.currentProviderIndex = -1;
    this.outputsProvider = this.cell.outputArea.outputs.map((output) => {
      return this.genericSearchProviderFactory({ view: output });
    });
    if (this.isActive && this.query && this.filters?.searchCellOutput !== false) {
      await this.refresh();
    }
    this.stateChangedEmitter.fire();
  };
}
