import type { LibroView } from '@difizen/libro-core';
import type { Disposable, Event } from '@difizen/libro-common/mana-app';
import {
  inject,
  notEmpty,
  prop,
  transient,
  watch,
} from '@difizen/libro-common/mana-app';
import { Emitter, DisposableCollection } from '@difizen/libro-common/mana-app';

import { LibroCellTOCProvider } from './cell-toc-provider.js';
import type { CellTOCProvider, IHeading } from './toc-protocol.js';
import { TOCProviderOption } from './toc-protocol.js';

export type LibroTOCProviderFactory = (option: TOCProviderOption) => LibroTOCProvider;
export const LibroTOCProviderFactory = Symbol('LibroTOCProviderFactory');

@transient()
export class LibroTOCProvider implements Disposable {
  protected libroCellTOCProvider: LibroCellTOCProvider;

  @prop() protected providerMap = new Map<string, CellTOCProvider>();

  @prop() headings: IHeading[] = [];

  @prop()
  protected view: LibroView;

  protected toDispose = new DisposableCollection();
  protected toDisposeWatcher = new DisposableCollection();

  disposed = false;

  protected activeCellChangeEmitter = new Emitter<IHeading>();

  get activeCellChange(): Event<IHeading> {
    return this.activeCellChangeEmitter.event;
  }

  constructor(
    @inject(TOCProviderOption) option: TOCProviderOption,
    @inject(LibroCellTOCProvider) libroCellTOCProvider: LibroCellTOCProvider,
  ) {
    this.view = option.view as LibroView;
    this.libroCellTOCProvider = libroCellTOCProvider;

    this.initUpdateWatch();
    this.updateTOC();
  }

  protected initUpdateWatch() {
    this.toDispose.push(
      watch(this.view.model, 'activeIndex', this.handleActiveCellChange),
    );
    this.toDispose.push(watch(this.view.model, 'cells', this.onCellsChanged));
    this.setupUpdaterWatcher();
  }

  protected setupUpdaterWatcher() {
    this.toDisposeWatcher.dispose();
    this.toDisposeWatcher = new DisposableCollection();
    this.getCellTocProviders().map((item) => {
      this.toDisposeWatcher.push(item.updateWatcher(this.updateTOC));
    });
  }

  protected handleActiveCellChange = () => {
    const header = this.getHeadingByCellIndex(this.view.model.activeIndex);
    if (header) {
      this.activeCellChangeEmitter.fire(header);
    }
  };

  protected updateTOC = () => {
    this.headings = this.getHeadings();
  };

  protected onActiveCellChanged = () => {
    this.updateTOC();
  };

  protected onCellsChanged = () => {
    this.setupUpdaterWatcher();
    this.updateTOC();
  };

  protected onContentChanged = () => {
    this.updateTOC();
  };

  getCellTocProviderList() {
    if (!this.view) {
      return [];
    }
    const cells = this.view.model.cells;
    return cells.map((cell) => {
      let tocProvider: CellTOCProvider | undefined;
      if (this.providerMap.has(cell.id)) {
        tocProvider = this.providerMap.get(cell.id);
      } else {
        tocProvider = this.libroCellTOCProvider.createCellTOCProvider(cell);
      }

      if (tocProvider) {
        this.providerMap.set(cell.id, tocProvider);
      }
      return { cellId: cell.model.id, tocProvider };
    });
  }

  protected getCellTocProviders() {
    return this.getCellTocProviderList()
      .map((item) => item.tocProvider)
      .filter(notEmpty);
  }

  protected getHeadings() {
    return this.getCellTocProviderList()
      .map((item) => {
        if (item.tocProvider !== undefined) {
          const headings = item.tocProvider.getHeadings();
          headings.forEach(
            (heading) =>
              (heading.dataset = { ...heading.dataset, cellId: item.cellId }),
          );
          return headings;
        }
        return;
      })
      .filter(notEmpty)
      .flat();
  }

  selectCellByHeading(heading: IHeading) {
    const cellId = heading?.dataset?.['cellId'];
    if (!cellId) {
      return;
    }
    const cell = this.view.model.cells.find((item) => item.model.id === cellId);
    if (cell) {
      this.view.selectCell(cell);
    }
  }

  getHeadingByCellIndex(index: number) {
    const cell = this.view.model.cells[index];
    return this.headings.find((item) => item?.dataset?.['cellId'] === cell.model.id);
  }

  dispose() {
    if (this.disposed) {
      return;
    }
    this.toDispose.dispose();
    this.toDisposeWatcher.dispose();
    this.providerMap.clear();
    this.disposed = true;
  }
}
