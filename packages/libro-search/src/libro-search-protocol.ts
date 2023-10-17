import type { CellView } from '@difizen/libro-core';
import type { Disposable, Event } from '@difizen/mana-app';
import type { View } from '@difizen/mana-app';
import { Syringe } from '@difizen/mana-app';

/**
 * Base search match interface
 */
export interface SearchMatch {
  /**
   * Text of the exact match itself
   */
  readonly text: string;

  /**
   * Start location of the match (in a text, this is the column)
   */
  position: number;
}

/**
 * HTML search match interface
 */
export interface HTMLSearchMatch extends SearchMatch {
  /**
   * Node containing the match
   */
  readonly node: Text;
}

/**
 * Filter interface
 */
export interface SearchFilter {
  /**
   * Filter title
   */
  title: string;
  /**
   * Filter description
   */
  description: string;
  /**
   * Default value
   */
  default: boolean;
  /**
   * Does the filter support replace?
   */
  supportReplace: boolean;
}
/**
 * Type of filters
 *
 */
export interface SearchFilters {
  searchCellOutput: boolean;
  onlySearchSelectedCells: boolean;
}

/**
 * Base search provider interface
 *
 * #### Notes
 * It is implemented by subprovider like searching on a single cell.
 */
export interface BaseSearchProvider extends Disposable {
  /**
   * Get an initial query value if applicable so that it can be entered
   * into the search box as an initial query
   *
   * @returns Initial value used to populate the search box.
   */
  getInitialQuery?(): string;
  /**
   * Start a search
   *
   * @param query Regular expression to test for
   * @param filters Filters to apply when searching
   */
  startQuery(query: RegExp, filters?: SearchFilters): Promise<void>;

  /**
   * Stop a search and clear any internal state of the provider
   */
  endQuery(): Promise<void>;

  /**
   * Clear currently highlighted match.
   */
  clearHighlight(): Promise<void>;

  /**
   * Highlight the next match
   *
   * @param loop Whether to loop within the matches list.
   *
   * @returns The next match if it exists
   */
  highlightNext(loop?: boolean): Promise<SearchMatch | undefined>;

  /**
   * Highlight the previous match
   *
   * @param loop Whether to loop within the matches list.
   *
   * @returns The previous match if it exists.
   */
  highlightPrevious(loop?: boolean): Promise<SearchMatch | undefined>;

  /**
   * Replace the currently selected match with the provided text
   * and highlight the next match.
   *
   * @param newText The replacement text
   * @param loop Whether to loop within the matches list.
   *
   * @returns A promise that resolves with a boolean indicating whether a replace occurred.
   */
  replaceCurrentMatch(newText: string, loop?: boolean): Promise<boolean>;

  /**
   * Replace all matches in the widget with the provided text
   *
   * @param newText The replacement text.
   *
   * @returns A promise that resolves with a boolean indicating whether a replace occurred.
   */
  replaceAllMatches(newText: string): Promise<boolean>;

  /**
   * Signal indicating that something in the search has changed, so the UI should update
   */
  readonly stateChanged: Event<void>;

  /**
   * The current index of the selected match.
   */
  readonly currentMatchIndex: number | undefined;

  /**
   * The number of matches.
   */
  readonly matchesCount: number | undefined;
}

/**
 * Search provider interface
 */
export interface SearchProvider extends BaseSearchProvider {
  /**
   * Set to true if the widget under search is read-only, false
   * if it is editable.  Will be used to determine whether to show
   * the replace option.
   */
  readonly isReadOnly: boolean;

  /**
   * Get the filters definition for the given provider.
   *
   * @returns The filters definition.
   *
   * ### Notes
   * TODO For now it only supports boolean filters (represented with checkboxes)
   */
  getFilters?(): Record<string, SearchFilter>;

  /**
   * Validate a new filter value for the widget.
   *
   * @param name The filter name
   * @param value The filter value candidate
   *
   * @returns The valid filter value
   */
  validateFilter?(name: string, value: boolean): Promise<boolean>;
}

// export const SearchProvider = Syringe.defineToken('SearchProvider');

export interface CellSearchProvider extends BaseSearchProvider {
  isActive: boolean;
}

export interface CellSearchProviderContribution {
  canHandle: (cell: CellView) => number;
  factory: (cell: CellView) => CellSearchProvider;
  getInitialQuery?: (cell: CellView) => string;
}

export const CellSearchProviderContribution = Syringe.defineToken(
  'CellSearchProviderContribution',
);

export const LIBRO_SEARCH_FOUND_CLASSES = [
  'cm-string',
  'cm-overlay',
  'cm-searching',
  'libro-searching',
];
export const LIBRO_SEARCH_SELECTED_CLASSES = [
  'CodeMirror-selectedtext',
  'libro-selectedtext',
];

export interface SearchProviderOption {
  view: View;
}
export const SearchProviderOption = Symbol('SearchProviderOption');
