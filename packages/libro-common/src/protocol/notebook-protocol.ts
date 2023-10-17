import type { PartialJSONObject } from '../json.js';

import type { ICell } from './cell-protocol.js';

/**
 * The earliest major version of the notebook format we support.
 */
export const MAJOR_VERSION = 4;

/**
 * The earliest minor version of the notebook format we support.
 */
export const MINOR_VERSION = 4;

/**
 * The kernelspec metadata.
 */
export interface IKernelspecMetadata extends PartialJSONObject {
  name: string;
  display_name: string;
}

/**
 * The language info metadata
 */
export interface ILanguageInfoMetadata extends PartialJSONObject {
  name: string;
  codemirror_mode?: string | PartialJSONObject;
  file_extension?: string;
  mimetype?: string;
  pygments_lexer?: string;
}

/**
 * The default metadata for the notebook.
 */
export interface INotebookMetadata extends PartialJSONObject {
  kernelspec?: IKernelspecMetadata;
  language_info?: ILanguageInfoMetadata;
  orig_nbformat?: number;
}

/**
 * The notebook content.
 */
export interface INotebookContent extends PartialJSONObject {
  metadata: INotebookMetadata;
  nbformat_minor: number;
  nbformat: number;
  cells: ICell[];
}

/**
 * A multiline string.
 */
export type MultilineString = string | string[];

/**
 * A mime-type keyed dictionary of data.
 */
export interface IMimeBundle extends PartialJSONObject {
  [key: string]: MultilineString | PartialJSONObject;
}

/**
 * Media attachments (e.g. inline images).
 */
export type IAttachments = Record<string, IMimeBundle | undefined>;

/**
 * The code cell's prompt number. Will be null if the cell has not been run.
 */
export type ExecutionCount = number | null;
