import type { PartialJSONObject, PartialJSONValue } from './json.js';
import { isObject } from './json.js';
import type {
  ICell,
  ICodeCell,
  IMarkdownCell,
  IRawCell,
} from './protocol/cell-protocol.js';
import type { MultilineString } from './protocol/notebook-protocol.js';
import type {
  IDisplayData,
  IDisplayUpdate,
  IError,
  IExecuteResult,
  IOutput,
  IStream,
} from './protocol/output-protocol.js';

/**
 * Validate a mime type/value pair.
 *
 * @param type - The mimetype name.
 *
 * @param value - The value associated with the type.
 *
 * @returns Whether the type/value pair are valid.
 */
export function validateMimeValue(
  type: string,
  value: MultilineString | PartialJSONObject,
): boolean {
  // Check if "application/json" or "application/foo+json"
  const jsonTest = /^application\/.+\+json$/;
  const isJSONType = type === 'application/json' || jsonTest.test(type);

  const isString = (x: any) => {
    return Object.prototype.toString.call(x) === '[object String]';
  };

  // If it is an array, make sure if is not a JSON type and it is an
  // array of strings.
  if (Array.isArray(value)) {
    if (isJSONType) {
      return false;
    }
    let valid = true;
    value.forEach((v) => {
      if (!isString(v)) {
        valid = false;
      }
    });
    return valid;
  }

  // If it is a string, make sure we are not a JSON type.
  if (isString(value)) {
    return !isJSONType;
  }

  // It is not a string, make sure it is a JSON type.
  if (!isJSONType) {
    return false;
  }

  // It is a JSON type, make sure it is a valid JSON object.
  return isObject(value);
}

/**
 * join multiline string, normalizing line endings to \n
 * @param value
 * @returns
 */
export function concatMultilineString(value: MultilineString): string {
  if (Array.isArray(value)) {
    return value.map((s) => s.replace(/\r\n/g, '\n').replace(/\r/g, '\n')).join('');
  } else {
    return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
}

/**
 * Test whether a cell is a raw cell.
 */
export function isRaw(cell: ICell): cell is IRawCell {
  return cell.cell_type === 'raw';
}

/**
 * Test whether a cell is a markdown cell.
 */
export function isMarkdown(cell: ICell): cell is IMarkdownCell {
  return cell.cell_type === 'markdown';
}

/**
 * Test whether a cell is a code cell.
 */
export function isCode(cell: ICell): cell is ICodeCell {
  return cell.cell_type === 'code';
}

/**
 * Test whether a cell is a code cell.
 */
export function isOutput(
  output: PartialJSONValue | IOutput[] | undefined,
): output is IOutput[] {
  return !!(output && output instanceof Array);
}

/**
 * Test whether an output is an execute result.
 */
export function isExecuteResult(output: IOutput): output is IExecuteResult {
  return output.output_type === 'execute_result';
}

/**
 * Test whether an output is from display data.
 */
export function isDisplayData(output: IOutput): output is IDisplayData {
  return output.output_type === 'display_data';
}

/**
 * Test whether an output is from updated display data.
 */
export function isDisplayUpdate(output: IOutput): output is IDisplayUpdate {
  return output.output_type === 'update_display_data';
}

/**
 * Test whether an output is from a stream.
 */
export function isStream(output: IOutput): output is IStream {
  return output.output_type === 'stream';
}

/**
 * Test whether an output is an error.
 */
export function isError(output: IOutput): output is IError {
  return output.output_type === 'error';
}
