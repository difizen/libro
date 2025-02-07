/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { View } from '@difizen/libro-common/app';
import { prop } from '@difizen/libro-common/app';
import { inject, transient } from '@difizen/libro-common/app';

import { AbstractSearchProvider } from './abstract-search-provider.js';
import { searchInHTML } from './libro-search-engine-html.js';
import type { HTMLSearchMatch } from './libro-search-protocol.js';
import {
  LIBRO_SEARCH_FOUND_CLASSES,
  LIBRO_SEARCH_SELECTED_CLASSES,
  SearchProviderOption,
} from './libro-search-protocol.js';

export type GenericSearchProviderFactory = (
  option: SearchProviderOption,
) => GenericSearchProvider;
export const GenericSearchProviderFactory = Symbol('GenericSearchProviderFactory');
/**
 * Generic DOM tree search provider.
 */
@transient()
export class GenericSearchProvider extends AbstractSearchProvider {
  protected _query: RegExp | null;
  @prop() protected _currentMatchIndex: number;
  @prop() protected _matches: HTMLSearchMatch[] = [];
  protected _mutationObserver: MutationObserver = new MutationObserver(
    this._onWidgetChanged.bind(this),
  );
  protected _markNodes = new Array<HTMLSpanElement>();
  /**
   * Report whether or not this provider has the ability to search on the given object
   */
  static isApplicable(domain: View): boolean {
    return !!domain.container?.current;
  }

  /**
   * The current index of the selected match.
   */
  override get currentMatchIndex(): number | undefined {
    return this._currentMatchIndex >= 0 ? this._currentMatchIndex : undefined;
  }

  /**
   * The current match
   */
  get currentMatch(): HTMLSearchMatch | undefined {
    return this._matches[this._currentMatchIndex] ?? undefined;
  }

  /**
   * The current matches
   */
  get matches(): HTMLSearchMatch[] {
    // Ensure that no other fn can overwrite matches index property
    // We shallow clone each node
    return this._matches
      ? this._matches.map((m) => Object.assign({}, m))
      : this._matches;
  }

  /**
   * The number of matches.
   */
  override get matchesCount(): number | undefined {
    return this._matches.length;
  }

  /**
   * Set to true if the widget under search is read-only, false
   * if it is editable.  Will be used to determine whether to show
   * the replace option.
   */
  readonly isReadOnly = true;

  constructor(@inject(SearchProviderOption) option: SearchProviderOption) {
    super(option);
  }
  /**
   * Clear currently highlighted match.
   */
  clearHighlight(): Promise<void> {
    if (this._currentMatchIndex >= 0) {
      const hit = this._markNodes[this._currentMatchIndex];
      hit.classList.remove(...LIBRO_SEARCH_SELECTED_CLASSES);
    }
    this._currentMatchIndex = -1;

    return Promise.resolve();
  }

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
  override dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.endQuery().catch((reason) => {
      console.error(`Failed to end search query.`, reason);
    });
    super.dispose();
  }

  /**
   * Move the current match indicator to the next match.
   *
   * @param loop Whether to loop within the matches list.
   *
   * @returns A promise that resolves once the action has completed.
   */
  async highlightNext(loop?: boolean): Promise<HTMLSearchMatch | undefined> {
    return this._highlightNext(false, loop ?? true) ?? undefined;
  }

  /**
   * Move the current match indicator to the previous match.
   *
   * @param loop Whether to loop within the matches list.
   *
   * @returns A promise that resolves once the action has completed.
   */
  async highlightPrevious(loop?: boolean): Promise<HTMLSearchMatch | undefined> {
    return this._highlightNext(true, loop ?? true) ?? undefined;
  }

  /**
   * Replace the currently selected match with the provided text
   *
   * @param newText The replacement text
   * @param loop Whether to loop within the matches list.
   *
   * @returns A promise that resolves with a boolean indicating whether a replace occurred.
   */
  async replaceCurrentMatch(newText: string, loop?: boolean): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Replace all matches in the notebook with the provided text
   *
   * @param newText The replacement text
   *
   * @returns A promise that resolves with a boolean indicating whether a replace occurred.
   */
  async replaceAllMatches(newText: string): Promise<boolean> {
    // This is read only, but we could loosen this in theory for input boxes...
    return Promise.resolve(false);
  }

  isMatchChanged(matches: HTMLSearchMatch[], newMatches: HTMLSearchMatch[]): boolean {
    if (matches.length !== newMatches.length) {
      return true;
    }
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].text !== newMatches[i].text) {
        return true;
      }
      if (matches[i].position !== newMatches[i].position) {
        return true;
      }
      if (matches[i].node !== newMatches[i].node) {
        return true;
      }
    }
    return false;
  }

  /**
   * Initialize the search using the provided options.  Should update the UI
   * to highlight all matches and "select" whatever the first match should be.
   *
   * @param query A RegExp to be use to perform the search
   * @param filters Filter parameters to pass to provider
   */
  startQuery = async (query: RegExp | null, filters = {}): Promise<void> => {
    this._query = query;

    if (query === null) {
      await this.endQuery();
      return Promise.resolve();
    }

    const matches = this.view.container?.current
      ? await searchInHTML(query, this.view.container?.current)
      : [];

    if (!this.isMatchChanged(this.matches, matches)) {
      return Promise.resolve();
    }

    await this.endQuery();

    // Transform the DOM
    let nodeIdx = 0;
    while (nodeIdx < matches.length) {
      const activeNode = matches[nodeIdx].node;
      const parent = activeNode.parentNode!;

      const subMatches = [matches[nodeIdx]];
      while (++nodeIdx < matches.length && matches[nodeIdx].node === activeNode) {
        subMatches.unshift(matches[nodeIdx]);
      }

      const markedNodes = subMatches.map((match) => {
        // TODO: support tspan for svg when svg support is added
        const markedNode = document.createElement('mark');
        markedNode.classList.add(...LIBRO_SEARCH_FOUND_CLASSES);
        markedNode.textContent = match.text;

        const newNode = activeNode.splitText(match.position);
        newNode.textContent = newNode.textContent!.slice(match.text.length);
        parent.insertBefore(markedNode, newNode);
        return markedNode;
      });

      // Insert node in reverse order as we replace from last to first
      // to maintain match position.
      for (let i = markedNodes.length - 1; i >= 0; i--) {
        this._markNodes.push(markedNodes[i]);
      }
    }
    if (this.view.container?.current) {
      // Watch for future changes:
      this._mutationObserver.observe(
        this.view.container?.current,
        // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
        {
          attributes: false,
          characterData: true,
          childList: true,
          subtree: true,
        },
      );
    }
    this._matches = matches;
  };

  /**
   * Clear the highlighted matches and any internal state.
   */
  async endQuery(): Promise<void> {
    this._mutationObserver.disconnect();
    this._markNodes.forEach((el) => {
      const parent = el.parentNode!;
      parent.replaceChild(document.createTextNode(el.textContent!), el);
      parent.normalize();
    });
    this._markNodes = [];
    this._matches = [];
    this._currentMatchIndex = -1;
  }

  protected _highlightNext(reverse: boolean, loop: boolean): HTMLSearchMatch | null {
    if (this._matches.length === 0) {
      return null;
    }
    if (this._currentMatchIndex === -1) {
      this._currentMatchIndex = reverse ? this.matches.length - 1 : 0;
    } else {
      const hit = this._markNodes[this._currentMatchIndex];
      hit.classList.remove(...LIBRO_SEARCH_SELECTED_CLASSES);

      this._currentMatchIndex = reverse
        ? this._currentMatchIndex - 1
        : this._currentMatchIndex + 1;
      if (
        loop &&
        (this._currentMatchIndex < 0 || this._currentMatchIndex >= this._matches.length)
      ) {
        // Cheap way to make this a circular buffer
        this._currentMatchIndex =
          (this._currentMatchIndex + this._matches.length) % this._matches.length;
      }
    }

    if (
      this._currentMatchIndex >= 0 &&
      this._currentMatchIndex < this._matches.length
    ) {
      const hit = this._markNodes[this._currentMatchIndex];
      hit.classList.add(...LIBRO_SEARCH_SELECTED_CLASSES);
      // If not in view, scroll just enough to see it
      if (!elementInViewport(hit)) {
        hit.scrollIntoView(reverse);
      }
      hit.focus();

      return this._matches[this._currentMatchIndex];
    } else {
      this._currentMatchIndex = -1;
      return null;
    }
  }

  protected async _onWidgetChanged(
    mutations: MutationRecord[],
    observer: MutationObserver,
  ) {
    this._currentMatchIndex = -1;
    // This is typically cheap, but we do not control the rate of change or size of the output
    await this.startQuery(this._query);
    this._stateChanged.fire();
  }
}
export function elementInViewport(el: HTMLElement): boolean {
  const boundingClientRect = el.getBoundingClientRect();
  return (
    boundingClientRect.top >= 0 &&
    boundingClientRect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    boundingClientRect.left >= 0 &&
    boundingClientRect.right <=
      (window.innerWidth || document.documentElement.clientWidth)
  );
}
