import type { PartialJSONObject } from '../json.js';

import type {
  ExecutionCount,
  IMimeBundle,
  MultilineString,
} from './notebook-protocol.js';

/**
 * Cell output metadata.
 */
export type OutputMetadata = PartialJSONObject;

/**
 * The valid output types.
 */
export type OutputType =
  | 'execute_result'
  | 'display_data'
  | 'stream'
  | 'error'
  | 'update_display_data';

/**
 * The base output type.
 */
export interface IBaseOutput extends PartialJSONObject {
  /**
   * Type of cell output.
   */
  output_type: string;
}

/**
 * Result of executing a code cell.
 */
export interface IExecuteResult extends IBaseOutput {
  /**
   * Type of cell output.
   */
  output_type: 'execute_result';

  /**
   * A result's prompt number.
   */
  execution_count: ExecutionCount;

  /**
   * A mime-type keyed dictionary of data.
   */
  data: IMimeBundle;

  /**
   * Cell output metadata.
   */
  metadata: OutputMetadata;
}

/**
 * Data displayed as a result of code cell execution.
 */
export interface IDisplayData extends IBaseOutput {
  /**
   * Type of cell output.
   */
  output_type: 'display_data';

  /**
   * A mime-type keyed dictionary of data.
   */
  data: IMimeBundle;

  /**
   * Cell output metadata.
   */
  metadata: OutputMetadata;
}

/**
 * Data displayed as an update to existing display data.
 */
export interface IDisplayUpdate extends IBaseOutput {
  /**
   * Type of cell output.
   */
  output_type: 'update_display_data';

  /**
   * A mime-type keyed dictionary of data.
   */
  data: IMimeBundle;

  /**
   * Cell output metadata.
   */
  metadata: OutputMetadata;
}

/**
 * Stream output from a code cell.
 */
export interface IStream extends IBaseOutput {
  /**
   * Type of cell output.
   */
  output_type: 'stream';

  /**
   * The name of the stream.
   */
  name: StreamType;

  /**
   * The stream's text output.
   */
  text: MultilineString;
}

/**
 * An alias for a stream type.
 */
export type StreamType = 'stdout' | 'stderr';

/**
 * Output of an error that occurred during code cell execution.
 */
export interface IError extends IBaseOutput {
  /**
   * Type of cell output.
   */
  output_type: 'error';

  /**
   * The name of the error.
   */
  ename: string;

  /**
   * The value, or message, of the error.
   */
  evalue: string;

  /**
   * The error's traceback.
   */
  traceback: string[];
}

/**
 * Unrecognized output.
 */
export type IUnrecognizedOutput = IBaseOutput;

/**
 * An output union type.
 */
export type IOutput =
  | IUnrecognizedOutput
  | IExecuteResult
  | IDisplayData
  | IStream
  | IError;
