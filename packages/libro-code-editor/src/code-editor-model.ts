import type { CellType } from '@difizen/libro-common';
import type { Disposable, Event } from '@difizen/libro-common/mana-app';
import { prop, transient, Emitter } from '@difizen/libro-common/mana-app';
import { v4 } from 'uuid';

import type { ITextSelection } from './code-editor-protocol.js';

export interface IModelOptions {
  /**
   * A unique identifier for the model.
   */
  id?: string;

  /**
   * The initial value of the model.
   */
  value?: string;

  /**
   * The mimetype of the model.
   */
  mimeType?: string;
}

/**
 * An editor model.
 */
export interface IModel extends Disposable {
  /**
   * The text stored in the model.
   */
  value: string;

  /**
   * A mime type of the model.
   *
   * #### Notes
   * It is never `null`, the default mime type is `text/plain`.
   */
  mimeType: string;

  /**
   * The currently selected code.
   */
  selections: ITextSelection[];
}

/**
 * The default implementation of the editor model.
 */
@transient()
export class Model implements IModel {
  id: string;

  /**
   * The text stored in the model.
   */
  @prop()
  value: string;

  /**
   * A mime type of the model.
   *
   * #### Notes
   * It is never `null`, the default mime type is `text/plain`.
   */
  @prop()
  mimeType: string;

  @prop()
  type: CellType = 'code';

  /**
   * The currently selected code.
   */
  @prop()
  selections: ITextSelection[];

  /**
   * Construct a new Model.
   */
  constructor(options?: IModelOptions) {
    // this.sharedModel = models.createStandaloneCell(this.type, options.id) as models.ISharedText;
    // this.sharedModel.changed.connect(this._onSharedModelChanged, this);
    this.id = options?.id ?? v4();

    this.value = options?.value ?? '';
    this.mimeType = options?.mimeType ?? 'text/plain';
    this.selections = [];
  }

  /**
   * A signal emitted when the shared model was switched.
   */
  get sharedModelSwitched(): Event<boolean> {
    return this._sharedModelSwitched;
  }

  /**
   * Whether the model is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources used by the model.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
  }

  protected _isDisposed = false;

  protected _sharedModelSwitchedEmitter = new Emitter<boolean>();
  protected _sharedModelSwitched = this._sharedModelSwitchedEmitter.event;
}
