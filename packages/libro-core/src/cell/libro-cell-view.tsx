import type { ViewComponent } from '@difizen/mana-app';
import { useInject, watch } from '@difizen/mana-app';
import { BaseView, view, ViewInstance, ViewOption } from '@difizen/mana-app';
import { inject } from '@difizen/mana-app';
import { DisposableCollection } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';
import React from 'react';

import type { CellViewOptions, CellModel } from '../libro-protocol.js';
import type { CellView, NotebookView } from '../libro-protocol.js';

import { CellService } from './libro-cell-protocol.js';
import type { LibroCell } from './libro-cell-protocol.js';
import { ExecutableCellModel } from './libro-executable-cell-model.js';

export const LibroCellComponent = React.forwardRef(function LibroCellComponent() {
  const instance = useInject<LibroCellView>(ViewInstance);
  return <>{instance.model.value}</>;
});

@view('libro-cell-view')
export class LibroCellView extends BaseView implements CellView {
  protected override toDispose = new DisposableCollection();
  options: CellViewOptions;

  @prop()
  model: CellModel;
  protected cellService: CellService;
  override view: ViewComponent = LibroCellComponent;
  parent!: NotebookView;

  @prop()
  override className?: string | undefined = 'libro-cell-view-container';

  @prop()
  hasInputHidden: boolean;

  @prop()
  collapsedHidden = false;

  @prop()
  hasModal = false;

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
  ) {
    super();
    this.cellService = cellService;
    this.options = options;
    this.hasInputHidden = false;

    const model = cellService.getModelFromCache(options.parentId, options.modelId);
    if (!model) {
      console.warn('cell model does not exist');
      throw new Error('cell model does not exist');
    }
    this.model = model;
    this.cellWatch();
  }

  cellWatch() {
    this.toDispose.push(
      watch(this.model, 'value', () => {
        this.parent.model.onChange?.();
      }),
    );
    this.toDispose.push(
      watch(this.model, 'type', () => {
        this.parent.model.onChange?.();
      }),
    );
    if (ExecutableCellModel.is(this.model)) {
      this.toDispose.push(
        watch(this.model, 'executeCount', () => {
          this.parent.model.onChange?.();
        }),
      );
    }
  }

  hasCellHidden() {
    return this.hasInputHidden;
  }

  async run() {
    return Promise.resolve(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldEnterEditorMode(_e: React.FocusEvent<HTMLElement>) {
    return false;
  }

  blur() {
    //
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  focus(_isEdit: boolean) {
    //
  }

  disposed = false;
  override dispose() {
    if (!this.disposed) {
      this.toDispose.dispose();
      super.dispose();
    }
    this.disposed = true;
  }
  toJSON(): LibroCell {
    const meta = { ...(this.model.toJSON() as LibroCell) };
    const modelContribution = this.cellService.findModelProvider(this.model.options);
    if (modelContribution?.cellMeta.nbformatType) {
      meta.metadata.libroCellType = modelContribution?.cellMeta.type;
      meta.cell_type = modelContribution?.cellMeta.nbformatType;
    }
    return meta;
  }

  toJSONWithoutId = () => {
    const JsonObject = this.toJSON();
    delete JsonObject.id;
    return {
      ...JsonObject,
    };
  };
}
