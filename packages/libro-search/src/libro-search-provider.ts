import type { SearchMatch } from '@difizen/libro-code-editor';
import type { CellView } from '@difizen/libro-core';
import { EditorCellView, LibroView, VirtualizedManager } from '@difizen/libro-core';
import { inject, prop, transient, equals } from '@difizen/mana-app';
import { Deferred, DisposableCollection } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import { AbstractSearchProvider } from './abstract-search-provider.js';
import { LibroCellSearchProvider } from './libro-cell-search-provider.js';
import { SearchProviderOption } from './libro-search-protocol.js';
import type {
  CellSearchProvider,
  SearchFilter,
  SearchFilters,
} from './libro-search-protocol.js';

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

export type LibroSearchProviderFactory = (
  option: SearchProviderOption,
) => LibroSearchProvider;
export const LibroSearchProviderFactory = Symbol('LibroSearchProviderFactory');
/**
 * Libro view search provider
 */
@transient()
export class LibroSearchProvider extends AbstractSearchProvider {
  @inject(LibroCellSearchProvider) libroCellSearchProvider: LibroCellSearchProvider;
  protected cellsChangeDeferred: Deferred<void> | undefined;

  protected toDispose = new DisposableCollection();
  @prop() protected currentProviderIndex: number | undefined = undefined;
  @prop() searchCellOutput = true;
  @prop() protected onlySearchSelectedCells = false;
  @prop() replaceMode = false;

  protected get filters(): SearchFilters {
    return {
      searchCellOutput: this.searchCellOutput && !this.replaceMode,
      onlySearchSelectedCells: this.onlySearchSelectedCells,
    };
  }

  protected query: RegExp | undefined = undefined;
  @prop() protected searchProviders: (CellSearchProvider | undefined)[] = [];
  @prop() protected providerMap = new Map<string, CellSearchProvider>();
  protected documentHasChanged = false;
  protected override view: LibroView;
  protected virtualizedManager: VirtualizedManager;

  updateSearchCellOutput(value: boolean): void {
    this.searchCellOutput = value;
    this.filters.searchCellOutput = value;
  }
  /**
   * @param option Provide the view to search in
   */
  constructor(
    @inject(SearchProviderOption) option: SearchProviderOption,
    @inject(VirtualizedManager) virtualizedManager: VirtualizedManager,
  ) {
    super(option);
    this.view = option.view as LibroView;
    this.virtualizedManager = virtualizedManager;
  }

  protected getProvider = (cell: CellView) => {
    return this.providerMap.get(cell.id);
  };

  /**
   * Report whether or not this provider has the ability to search on the given object
   *
   * @param domain Widget to test
   * @returns Search ability
   */
  static isApplicable(domain: LibroView): domain is LibroView {
    // check to see if the CMSearchProvider can search on the
    // first cell, false indicates another editor is present
    return domain instanceof LibroView;
  }

  /**
   * The current index of the selected match.
   */
  override get currentMatchIndex(): number | undefined {
    let agg = 0;
    let found = false;
    for (let idx = 0; idx < this.searchProviders.length; idx++) {
      const provider = this.searchProviders[idx];
      const localMatch = provider?.currentMatchIndex;
      if (localMatch !== undefined) {
        agg += localMatch;
        found = true;
        break;
      } else {
        agg += provider?.matchesCount ?? 0;
      }
    }
    return found ? agg : undefined;
  }

  /**
   * The number of matches.
   */
  override get matchesCount(): number | undefined {
    const count = this.view.model.cells.reduce((sum, cell) => {
      const provider = this.getProvider(cell);
      sum += provider?.matchesCount || 0;
      return sum;
    }, 0);
    if (count === 0) {
      return undefined;
    }
    return count;
  }

  /**
   * Set to true if the widget under search is read-only, false
   * if it is editable.  Will be used to determine whether to show
   * the replace option.
   */
  get isReadOnly(): boolean {
    return this.view?.model?.readOnly ?? false;
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
    this.toDispose.dispose();
    this.providerMap.clear();
    super.dispose();

    // const index = this.view.model.active;
    this.endQuery()
      .then(() => {
        if (!this.view.isDisposed) {
          // this.view.model.active = index;
          // TODO: should active cell?
        }
        return;
      })
      .catch((reason) => {
        console.error(`Fail to end search query in notebook:\n${reason}`);
      });
  }

  /**
   * Get the filters for the given provider.
   *
   * @returns The filters.
   */
  override getFilters(): Record<string, SearchFilter> {
    return {
      output: {
        title: l10n.t('在 Output 中查找'),
        description: l10n.t('在 Output 中查找'),
        default: false,
        supportReplace: false,
      },
      selectedCells: {
        title: l10n.t('仅在选中 cell 中查找'),
        description: l10n.t('仅在选中 cell 中查找'),
        default: false,
        supportReplace: true,
      },
    };
  }

  /**
   * Get an initial query value if applicable so that it can be entered
   * into the search box as an initial query
   *
   * @returns Initial value used to populate the search box.
   */
  override getInitialQuery = (): string => {
    const activeCell = this.view.model.active;
    if (activeCell) {
      return this.libroCellSearchProvider.getInitialQuery(activeCell);
    }
    return '';
  };

  /**
   * Clear currently highlighted match.
   */
  clearHighlight = async (): Promise<void> => {
    if (this.currentProviderIndex !== undefined) {
      await this.searchProviders[this.currentProviderIndex]?.clearHighlight();
      this.currentProviderIndex = undefined;
    }
  };

  /**
   * Highlight the next match.
   *
   * @param loop Whether to loop within the matches list.
   *
   * @returns The next match if available.
   */
  highlightNext = async (loop = true): Promise<SearchMatch | undefined> => {
    const match = await this.stepNext(false, loop);
    return match ?? undefined;
  };

  /**
   * Highlight the previous match.
   *
   * @param loop Whether to loop within the matches list.
   *
   * @returns The previous match if available.
   */
  highlightPrevious = async (loop = true): Promise<SearchMatch | undefined> => {
    const match = await this.stepNext(true, loop);
    return match ?? undefined;
  };

  /**
   * Search for a regular expression with optional filters.
   *
   * @param query A regular expression to test for
   * @param filters Filter parameters to pass to provider
   *
   */
  startQuery = async (
    query: RegExp,
    filters?: SearchFilters,
    highlightNext = true,
  ): Promise<void> => {
    if (!this.view) {
      return;
    }
    await this.endQuery();
    const cells = this.view.model.cells;

    this.query = query;

    // TODO: support selected cells
    if (this.filters?.onlySearchSelectedCells) {
      // watch(this.view.model, 'selections', this._onSelectionChanged);
      // this.view.model.selectionChanged.connect(this._onSelectionChanged, this);
    }
    // For each cell, create a search provider
    this.searchProviders = await Promise.all(
      cells.map(async (cell) => {
        let cellSearchProvider;
        if (this.providerMap.has(cell.id)) {
          cellSearchProvider = this.providerMap.get(cell.id);
        } else {
          cellSearchProvider =
            this.libroCellSearchProvider.createCellSearchProvider(cell);
        }
        if (cellSearchProvider) {
          this.providerMap.set(cell.id, cellSearchProvider);
        }
        // cellSearchProvider.stateChanged(this._onSearchProviderChanged);
        // await cellSearchProvider.setIsActive(
        //   !this._filters!.selectedCells || this.widget.content.isSelectedOrActive(cell),
        // );
        await cellSearchProvider?.startQuery(query, this.filters);
        return cellSearchProvider;
      }),
    );
    this.currentProviderIndex = this.getActiveIndex();

    if (!this.documentHasChanged && highlightNext) {
      await this.highlightNext(false);
    }
    this.documentHasChanged = false;

    return Promise.resolve();
  };

  /**
   * Stop the search and clear all internal state.
   */
  endQuery = async (): Promise<void> => {
    await Promise.all(
      this.searchProviders.map((provider) => {
        // provider?.stateChanged(this._onSearchProviderChanged);
        return provider?.endQuery();
      }),
    );
    this.searchProviders.length = 0;
    this.currentProviderIndex = undefined;
  };

  /**
   * Replace the currently selected match with the provided text
   *
   * @param newText The replacement text.
   * @param loop Whether to loop within the matches list.
   *
   * @returns A promise that resolves with a boolean indicating whether a replace occurred.
   */
  replaceCurrentMatch = async (newText: string, loop = true): Promise<boolean> => {
    let replaceOccurred = false;
    // TODO: makrdown unrendered
    // const unrenderMarkdownCell = async (highlightNext = false): Promise<void> => {
    //   // Unrendered markdown cell
    //   const activeCell = this.view?.model.active;
    //   if (activeCell?.model.type === 'markdown' && (activeCell as MarkdownCell).rendered) {
    //     (activeCell as MarkdownCell).rendered = false;
    //     if (highlightNext) {
    //       await this.highlightNext(loop);
    //     }
    //   }
    // };

    if (this.currentProviderIndex !== undefined) {
      // await unrenderMarkdownCell();

      const searchEngine = this.searchProviders[this.currentProviderIndex];
      replaceOccurred = !!(await searchEngine?.replaceCurrentMatch(newText));
    }

    await this.highlightNext(loop);
    // Force highlighting the first hit in the unrendered cell
    // await unrenderMarkdownCell(true);
    return replaceOccurred;
  };

  /**
   * Replace all matches in the notebook with the provided text
   *
   * @param newText The replacement text.
   *
   * @returns A promise that resolves with a boolean indicating whether a replace occurred.
   */
  replaceAllMatches = async (newText: string): Promise<boolean> => {
    const replacementOccurred = await Promise.all(
      this.searchProviders.map((provider) => {
        return provider?.replaceAllMatches(newText);
      }),
    );
    return replacementOccurred.includes(true);
  };

  protected addCellProvider = (index: number) => {
    const cell = this.view.model.cells[index];
    const cellSearchProvider =
      this.libroCellSearchProvider.createCellSearchProvider(cell);
    const current = this.searchProviders.slice();
    current.splice(index, 0, cellSearchProvider);
    this.searchProviders = current;
    if (cellSearchProvider) {
      cellSearchProvider.stateChanged(this.onSearchProviderChanged);
      if (this.query) {
        cellSearchProvider.startQuery(this.query, this.filters);
      }
    }
    // void cellSearchProvider
    //   .setIsActive(
    //     !(this._filters?.selectedCells ?? false) || this.widget.content.isSelectedOrActive(cell),
    //   )
    //   .then(() => {
    //     void cellSearchProvider.startQuery(this._query, this._filters);
    //   });
  };

  protected removeCellProvider = (index: number) => {
    const current = this.searchProviders.slice();
    const provider = current.slice(index, 1)[0];
    provider?.dispose();
  };

  protected doCellsChanged = async (): Promise<void> => {
    if (this.query) {
      this.startQuery(this.query);
    } else {
      this.endQuery();
    }
    this.onSearchProviderChanged();
    this.cellsChangeDeferred = undefined;
  };

  onCellsChanged = async (): Promise<void> => {
    if (!this.cellsChangeDeferred) {
      this.cellsChangeDeferred = new Deferred();
      this.cellsChangeDeferred.promise.then(this.doCellsChanged).catch(console.error);
      this.cellsChangeDeferred.resolve();
    }
  };

  protected getActiveIndex = (): number | undefined => {
    if (!this.view.activeCell) {
      return undefined;
    }
    const index = this.view.model.cells.findIndex((cell) =>
      equals(cell, this.view.activeCell),
    );
    if (index < 0) {
      return undefined;
    }
    return index;
  };

  protected selectCell(selectIndex: number) {
    if (selectIndex >= 0 && selectIndex < this.view.model.cells.length - 1) {
      this.view.model.selectCell(this.view.model.cells[selectIndex]);
    }
  }

  protected stepNext = async (
    reverse = false,
    loop = false,
  ): Promise<SearchMatch | undefined> => {
    const activateNewMatch = async (match: SearchMatch) => {
      if (this.getActiveIndex() !== this.currentProviderIndex!) {
        this.selectCell(this.currentProviderIndex!);
      }
      const activeCell = this.view.activeCell;

      if (!activeCell) {
        return;
      }

      const node = activeCell.container?.current;

      if (!elementInViewport(node!)) {
        try {
          if (this.view.activeCell) {
            if (this.virtualizedManager.isVirtualized) {
              if (EditorCellView.is(activeCell)) {
                const line = activeCell.editor?.getPositionAt(match.position)?.line;

                this.view.model.scrollToCellView({
                  cellIndex: this.view.activeCellIndex,
                  lineIndex: line,
                });
              }
            } else {
              this.view.model.scrollToView(this.view.activeCell);
            }
          }
        } catch (error) {
          // no-op
        }
      }
      // Unhide cell
      if (activeCell.hasInputHidden) {
        activeCell.hasInputHidden = false;
      }
      if (!elementInViewport(node!)) {
        // It will not be possible the cell is not in the view
        return;
      }
      if (EditorCellView.is(activeCell)) {
        // await activeCell.editor;
        const editor = activeCell.editor;
        editor?.revealSelection(editor.getSelection());
      }
    };
    if (this.currentProviderIndex === undefined) {
      this.currentProviderIndex = this.getActiveIndex()!;
    }
    const startIndex = this.currentProviderIndex;
    do {
      const searchEngine = this.searchProviders[this.currentProviderIndex];
      const match = reverse
        ? await searchEngine?.highlightPrevious()
        : await searchEngine?.highlightNext();
      if (match) {
        await activateNewMatch(match);
        return match;
      } else {
        this.currentProviderIndex = this.currentProviderIndex + (reverse ? -1 : 1);
        if (loop) {
          // We loop on all cells, not hit found
          if (this.currentProviderIndex === startIndex) {
            break;
          }
          this.currentProviderIndex =
            (this.currentProviderIndex + this.searchProviders.length) %
            this.searchProviders.length;
        }
      }
    } while (
      0 <= this.currentProviderIndex &&
      this.currentProviderIndex < this.searchProviders.length
    );

    if (loop) {
      // Search a last time in the first provider as it may contain more
      // than one matches
      const searchEngine = this.searchProviders[this.currentProviderIndex];
      const match = reverse
        ? await searchEngine?.highlightPrevious()
        : await searchEngine?.highlightNext();

      if (match) {
        await activateNewMatch(match);
        return match;
      }
    }

    this.currentProviderIndex = undefined;
    return undefined;
  };

  onActiveCellChanged = async () => {
    await this._onSelectionChanged();

    if (this.getActiveIndex() !== this.currentProviderIndex) {
      await this.clearHighlight();
    }
  };

  protected onSearchProviderChanged = () => {
    // Don't highlight the next occurrence when the query
    // follows a document change
    this.documentHasChanged = true;
    this._stateChanged.fire();
  };

  protected _onSelectionChanged = async () => {
    // if (this.onlySelectedCells) {
    //   const cells = this.widget.content.widgets;
    //   await Promise.all(
    //     this._searchProviders.map((provider, index) =>
    //       provider.setIsActive(this.widget.content.isSelectedOrActive(cells[index])),
    //     ),
    //   );
    //   this._onSearchProviderChanged();
    // }
  };
}
