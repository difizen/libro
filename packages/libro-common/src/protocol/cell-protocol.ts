import { URI } from '@difizen/libro-common/mana-app';

import type { PartialJSONObject } from '../json.js';

import type {
  ExecutionCount,
  IAttachments,
  MultilineString,
} from './notebook-protocol.js';
import type { IOutput } from './output-protocol.js';

/**
 * A type which describes the type of cell.
 */
export type CellType = 'code' | 'markdown' | 'raw' | string;

/**
 * The Jupyter metadata namespace.
 */
export interface IBaseCellJupyterMetadata extends PartialJSONObject {
  /**
   * Whether the source is hidden.
   */
  source_hidden: boolean;
}

/**
 * Cell-level metadata.
 */
export interface IBaseCellMetadata extends PartialJSONObject {
  /**
   * Whether the cell is trusted.
   *
   * #### Notes
   * This is not strictly part of the nbformat spec, but it is added by
   * the contents manager.
   *
   * See https://jupyter-server.readthedocs.io/en/latest/operators/security.html.
   */
  trusted: boolean;

  /**
   * The cell's name. If present, must be a non-empty string.
   */
  name: string;

  /**
   * The Jupyter metadata namespace
   */
  jupyter: Partial<IBaseCellJupyterMetadata>;

  /**
   * The cell's tags. Tags must be unique, and must not contain commas.
   */
  tags: string[];
}

/**
 * The base cell interface.
 */
export interface IBaseCell extends PartialJSONObject {
  /**
   * String identifying the type of cell.
   */
  cell_type: string;

  /**
   * Contents of the cell, represented as an array of lines.
   */
  source: MultilineString;

  /**
   * Cell-level metadata.
   */
  metadata: Partial<ICellMetadata>;
}

/**
 * Metadata for the raw cell.
 */
export interface IRawCellMetadata extends IBaseCellMetadata {
  /**
   * Raw cell metadata format for nbconvert.
   */
  format: string;
}

/**
 * A raw cell.
 */
export interface IRawCell extends IBaseCell {
  /**
   * A string field representing the identifier of this particular cell.
   *
   * Notebook format 4.4 requires no id field, but format 4.5 requires an id
   * field. We need to handle both cases, so we make id optional here.
   */
  id?: string | undefined;

  /**
   * String identifying the type of cell.
   */
  cell_type: 'raw';

  /**
   * Cell-level metadata.
   */
  metadata: Partial<IRawCellMetadata>;

  /**
   * Cell attachments.
   */
  attachments?: IAttachments | undefined;
}

/**
 * A markdown cell.
 */
export interface IMarkdownCell extends IBaseCell {
  /**
   * A string field representing the identifier of this particular cell.
   *
   * Notebook format 4.4 requires no id field, but format 4.5 requires an id
   * field. We need to handle both cases, so we make id optional here.
   */
  id?: string | undefined;

  /**
   * String identifying the type of cell.
   */
  cell_type: 'markdown';

  /**
   * Cell attachments.
   */
  attachments?: IAttachments | undefined;
}

/**
 * The Jupyter metadata namespace for code cells.
 */
export interface ICodeCellJupyterMetadata extends IBaseCellJupyterMetadata {
  /**
   * Whether the outputs are hidden. See https://github.com/jupyter/nbformat/issues/137.
   */
  outputs_hidden: boolean;
}

/**
 * Metadata for a code cell.
 */
export interface ICodeCellMetadata extends IBaseCellMetadata {
  /**
   * Whether the cell is collapsed/expanded.
   */
  collapsed: boolean;

  /**
   * The Jupyter metadata namespace
   */
  jupyter: Partial<ICodeCellJupyterMetadata>;

  /**
   * Whether the cell's output is scrolled, unscrolled, or autoscrolled.
   */
  scrolled: boolean | 'auto';
}

/**
 * A code cell.
 */
export interface ICodeCell extends IBaseCell {
  /**
   * A string field representing the identifier of this particular cell.
   *
   * Notebook format 4.4 requires no id field, but format 4.5 requires an id
   * field. We need to handle both cases, so we make id optional here.
   */
  id?: string | undefined;

  /**
   * String identifying the type of cell.
   * Changed in Libro: cell_type 不再限制只能是code，以便支持多种语言的cell
   */
  cell_type: string;
  // cell_type: 'code';

  /**
   * Cell-level metadata.
   */
  metadata: Partial<ICodeCellMetadata>;

  /**
   * Execution, display, or stream outputs.
   */
  outputs: IOutput[];

  /**
   * The code cell's prompt number. Will be null if the cell has not been run.
   */
  execution_count: ExecutionCount;
}

/**
 * An unrecognized cell.
 */
export type IUnrecognizedCell = IBaseCell;

/**
 * A cell union type.
 */
export type ICell = IRawCell | IMarkdownCell | ICodeCell | IUnrecognizedCell;

/**
 * A union metadata type.
 */
export type ICellMetadata = IBaseCellMetadata | IRawCellMetadata | ICodeCellMetadata;

export const LibroCellURIScheme = 'vscode-notebook-cell';

export namespace CellUri {
  /**
   * 兼容 VSCode
   */
  export const NotebookScheme = 'vscode-notebook';

  /**
   * 兼容 VSCode
   */
  export const CellScheme = 'vscode-notebook-cell';

  export const from = (notebookId: string, cellId: string): URI => {
    let uri = new URI(notebookId);
    uri = URI.withScheme(uri, LibroCellURIScheme);
    uri = URI.withQuery(uri, URI.stringifyQuery({ cellId }));
    return uri;
  };

  export const is = (uri: URI): boolean => {
    return uri.scheme === CellUri.CellScheme;
  };

  export const parse = (
    uri: URI,
  ): { notebookId: string; cellId: string } | undefined => {
    if (!CellUri.is(uri)) {
      return;
    }
    return {
      notebookId: uri.path.toString(),
      cellId: uri.getParsedQuery()['cellId'],
    };
  };
}
