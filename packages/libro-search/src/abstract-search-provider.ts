import type { SearchMatch } from '@difizen/libro-code-editor';
import type { Event } from '@difizen/libro-common/app';
import type { View } from '@difizen/libro-common/app';
import { Emitter } from '@difizen/libro-common/app';
import { transient } from '@difizen/libro-common/app';

import type {
  SearchFilter,
  SearchFilters,
  SearchProvider,
} from './libro-search-protocol.js';
/**
 * Abstract class implementing the search provider interface.
 */
@transient()
export abstract class AbstractSearchProvider implements SearchProvider {
  // Needs to be protected so subclass can emit the signal too.
  protected _stateChanged: Emitter<void> = new Emitter();
  protected _disposed = false;
  protected view: View;
  get disposed(): boolean {
    return this._disposed;
  }
  /**
   * Constructor
   */
  constructor(option: { view: View }) {
    this.view = option.view;
  }

  /**
   * Signal indicating that something in the search has changed, so the UI should update
   */
  get stateChanged(): Event<void> {
    return this._stateChanged.event;
  }

  /**
   * The current index of the selected match.
   */
  get currentMatchIndex(): number | undefined {
    return undefined;
  }

  /**
   * Whether the search provider is disposed or not.
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * The number of matches.
   */
  get matchesCount(): number | undefined {
    return undefined;
  }

  /**
   * Set to true if the widget under search is read-only, false
   * if it is editable.  Will be used to determine whether to show
   * the replace option.
   */
  abstract get isReadOnly(): boolean;

  /**
   * Dispose of the resources held by the search provider.
   *
   * #### Notes
   * If the object's `dispose` method is called more than once, all
   * calls made after the first will be a no-op.
   *
   * #### Undefined Behavior
   * It is undefined behavior to use any functionality of the object
   * after it has been disposed unless otherwise explicitly noted.
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
  }

  /**
   * Get an initial query value if applicable so that it can be entered
   * into the search box as an initial query
   *
   * @returns Initial value used to populate the search box.
   */
  getInitialQuery(): string {
    return '';
  }

  /**
   * Get the filters for the given provider.
   *
   * @returns The filters.
   *
   * ### Notes
   * TODO For now it only supports boolean filters (represented with checkboxes)
   */
  getFilters(): Record<string, SearchFilter> {
    return {};
  }

  /**
   * Start a search using the provided options.
   *
   * @param query A RegExp to be use to perform the search
   * @param filters Filter parameters to pass to provider
   */
  abstract startQuery(
    query: RegExp,
    filters: SearchFilters,
    highlightNext?: boolean,
  ): Promise<void>;

  /**
   * Stop a search and clear any internal state of ssthe search provider.
   */
  abstract endQuery(): Promise<void>;

  /**
   * Clear currently highlighted match.
   */
  abstract clearHighlight(): Promise<void>;

  /**
   * Highlight the next match.
   *
   * @returns The next match if available
   */
  abstract highlightNext(): Promise<SearchMatch | undefined>;

  /**
   * Highlight the previous match.
   *
   * @returns The previous match if available.
   */
  abstract highlightPrevious(): Promise<SearchMatch | undefined>;

  /**
   * Replace the currently selected match with the provided text
   *
   * @param newText The replacement text
   *
   * @returns A promise that resolves with a boolean indicating whether a replace occurred.
   */
  abstract replaceCurrentMatch(newText: string): Promise<boolean>;

  /**
   * Replace all matches in the widget with the provided text
   *
   * @param newText The replacement text
   *
   * @returns A promise that resolves with a boolean indicating whether a replace occurred.
   */
  abstract replaceAllMatches(newText: string): Promise<boolean>;
}
