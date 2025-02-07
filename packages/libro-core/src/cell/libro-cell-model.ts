import { Model } from '@difizen/libro-code-editor';
import type { ICell } from '@difizen/libro-common';
import { concatMultilineString } from '@difizen/libro-common';
import { DisposableCollection, watch } from '@difizen/libro-common/mana-app';
import { prop, inject, postConstruct, transient } from '@difizen/libro-common/mana-app';

import type { DefaultDecodedFormatter } from '../formatter/index.js';
import { DefaultEncodedFormatter, LibroFormatterManager } from '../formatter/index.js';
import { CellOptions } from '../libro-protocol.js';
import type { CellModel } from '../libro-protocol.js';

import type { LibroCellMetadata } from './libro-cell-protocol.js';
import { getLibroCellType } from './libro-cell-protocol.js';

@transient()
export class LibroCellModel extends Model implements CellModel {
  toDispose = new DisposableCollection();

  options: CellOptions;

  libroFormatType: string;

  _decodeObject: DefaultDecodedFormatter;

  @inject(LibroFormatterManager)
  libroFormatterManager: LibroFormatterManager<
    DefaultDecodedFormatter,
    DefaultDecodedFormatter
  >;

  @prop()
  metadata: Partial<LibroCellMetadata>;

  @prop()
  trusted: boolean;

  version = 0;

  constructor(@inject(CellOptions) options: CellOptions) {
    super({
      id: options.cell.id as string,
      value: concatMultilineString(options?.cell?.source ?? ''),
    });
    this.options = options;
    this.type = getLibroCellType(options);
    this.libroFormatType = 'formatter-string';

    this.metadata = {
      ...options?.cell?.metadata,
      libroFormatter: this.libroFormatType,
    };
    this.trusted = options?.cell?.metadata?.trusted ?? false;
  }

  @postConstruct()
  init() {
    const formatValue: DefaultEncodedFormatter = DefaultEncodedFormatter.is(
      this.options?.cell,
    )
      ? this.options?.cell
      : {
          ...this.options?.cell,
          metadata: {
            ...this.options?.cell.metadata,
            libroFormatter: this.libroFormatType,
          },
        };

    this.decodeObject = this.libroFormatterManager.adapter(
      this.libroFormatType,
      formatValue,
    );
    this.updateVersion();
  }

  updateVersion = () => {
    watch<Model>(this, 'value', () => {
      this.version++;
    });
  };

  get source(): string {
    const encodedValue = this.libroFormatterManager.encode(
      this.libroFormatType,
      this.decodeObject,
    );
    return concatMultilineString(encodedValue.source);
  }

  set decodeObject(data: DefaultDecodedFormatter) {
    this.value = data.value;
    this._decodeObject = data;
  }

  get decodeObject() {
    return { ...this._decodeObject, value: this.value };
  }

  toJSON(): Omit<ICell, 'outputs'> {
    return {
      id: this.id,
      cell_type: this.type,
      metadata: this.metadata,
      source: this.source,
    };
  }

  disposed = false;
  override dispose() {
    if (!this.disposed) {
      this.toDispose.dispose();
    }
    this.disposed = true;
  }
}

export function isLibroCellModel(model: CellModel): model is LibroCellModel {
  return model instanceof LibroCellModel;
}
