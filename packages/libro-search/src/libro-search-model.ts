import type { Disposable } from '@difizen/mana-app';
import { DisposableCollection, Emitter } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import debounce from 'lodash.debounce';

import type { SearchProvider } from './libro-search-protocol.js';
import type { SearchFilter, SearchFilters } from './libro-search-protocol.js';
import { LibroSearchUtils } from './libro-search-utils.js';

/**
 * Search in a document model.
 */
@singleton()
export class LibroSearchModel implements Disposable {
  utils: LibroSearchUtils;
  protected _disposed?: boolean = false;
  protected _caseSensitive = false;
  protected parsingError = '';
  protected _filters: SearchFilters = {
    searchCellOutput: true,
    onlySearchSelectedCells: false,
  };
  protected _replaceText = '';
  protected searchDebouncer: any;
  protected _searchExpression = '';
  protected _useRegex = false;
  protected disposedEmitter = new Emitter<void>();
  protected searchProvider: SearchProvider;
  protected toDispose = new DisposableCollection();
  get onDisposed() {
    return this.disposedEmitter.event;
  }

  get disposed() {
    return !!this._disposed;
  }
  /**
   * Search document model
   * @param searchProvider Provider for the current document
   * @param searchDebounceTime Debounce search time
   */
  constructor(
    @inject(LibroSearchUtils) utils: LibroSearchUtils,
    searchProvider: SearchProvider,
    searchDebounceTime: number,
  ) {
    this.utils = utils;
    this.searchProvider = searchProvider;
    // this._filters = {};
    // if (this.searchProvider.getFilters) {
    //   const filters = this.searchProvider.getFilters();
    //   for (const filter in filters) {
    //     this._filters[filter] = filters[filter].default;
    //   }
    // }

    this.toDispose.push(searchProvider.stateChanged(this.refresh));

    this.searchDebouncer = debounce(() => {
      this.updateSearch().catch((reason) => {
        console.error('Failed to update search on document.', reason);
      });
    }, searchDebounceTime);
  }

  /**
   * Whether the search is case sensitive or not.
   */
  get caseSensitive(): boolean {
    return this._caseSensitive;
  }
  set caseSensitive(v: boolean) {
    if (this._caseSensitive !== v) {
      this._caseSensitive = v;
      this.refresh();
    }
  }

  /**
   * Current highlighted match index.
   */
  get currentIndex(): number | undefined {
    return this.searchProvider.currentMatchIndex;
  }

  /**
   * Filter values.
   */
  get filters(): SearchFilters {
    return this._filters;
  }

  /**
   * Filter definitions for the current provider.
   */
  get filtersDefinition(): Record<string, SearchFilter> {
    return this.searchProvider.getFilters?.() ?? {};
  }

  /**
   * The initial query string.
   */
  get initialQuery(): string {
    if (!this.searchProvider.getInitialQuery) {
      return this._searchExpression;
    }
    return this._searchExpression || this.searchProvider.getInitialQuery();
  }

  /**
   * Whether the document is read-only or not.
   */
  get isReadOnly(): boolean {
    return this.searchProvider.isReadOnly;
  }

  /**
   * Replacement expression
   */
  get replaceText(): string {
    return this._replaceText;
  }
  set replaceText(v: string) {
    if (this._replaceText !== v) {
      this._replaceText = v;
    }
  }

  /**
   * Search expression
   */
  get searchExpression(): string {
    return this._searchExpression;
  }
  set searchExpression(v: string) {
    if (this._searchExpression !== v) {
      this._searchExpression = v;
      this.refresh();
    }
  }

  /**
   * Total number of matches.
   */
  get totalMatches(): number | undefined {
    return this.searchProvider.matchesCount;
  }

  /**
   * Whether to use regular expression or not.
   */
  get useRegex(): boolean {
    return this._useRegex;
  }
  set useRegex(v: boolean) {
    if (this._useRegex !== v) {
      this._useRegex = v;
      this.refresh();
    }
  }

  /**
   * Dispose the model.
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }
    if (this._searchExpression) {
      this.endQuery().catch((reason) => {
        console.error(`Failed to end query '${this._searchExpression}.`, reason);
      });
    }
    this.toDispose.dispose();
    this.searchDebouncer.dispose();
    this._disposed = true;
  }

  /**
   * End the query.
   */
  async endQuery(): Promise<void> {
    await this.searchProvider.endQuery();
  }

  /**
   * Highlight the next match.
   */
  async highlightNext(): Promise<void> {
    await this.searchProvider.highlightNext();
  }

  /**
   * Highlight the previous match
   */
  async highlightPrevious(): Promise<void> {
    await this.searchProvider.highlightPrevious();
  }

  /**
   * Refresh search
   */
  refresh(): void {
    this.searchDebouncer.invoke().catch((reason: any) => {
      console.error('Failed to invoke search document debouncer.', reason);
    });
  }

  /**
   * Replace all matches.
   */
  async replaceAllMatches(): Promise<void> {
    await this.searchProvider.replaceAllMatches(this._replaceText);
    // Emit state change as the index needs to be updated
  }

  /**
   * Replace the current match.
   */
  async replaceCurrentMatch(): Promise<void> {
    await this.searchProvider.replaceCurrentMatch(this._replaceText);
  }

  /**
   * Set the value of a given filter.
   *
   * @param name Filter name
   * @param v Filter value
   */
  async setFilter(_name: string, _v: boolean): Promise<void> {
    // if (this._filters[name] !== v) {
    //   if (this.searchProvider.validateFilter) {
    //     this._filters[name] = await this.searchProvider.validateFilter(name, v);
    //     // If the value was changed
    //     if (this._filters[name] === v) {
    //       this.refresh();
    //     }
    //   } else {
    //     this._filters[name] = v;
    //     this.refresh();
    //   }
    // }
  }

  protected async updateSearch(): Promise<void> {
    if (this.parsingError) {
      this.parsingError = '';
    }
    try {
      const query = this.searchExpression
        ? this.utils.parseQuery(
            this.searchExpression,
            this.caseSensitive,
            this.useRegex,
          )
        : null;
      if (query) {
        await this.searchProvider.startQuery(query, this._filters);
        // Emit state change as the index needs to be updated
      }
    } catch (reason: any) {
      this.parsingError = reason.toString();
      console.error(`Failed to parse expression ${this.searchExpression}`, reason);
    }
  }
}
