/* eslint-disable no-param-reassign */
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import type { IPosition as CodeEditorPosition } from '@difizen/libro-code-editor';
import type * as lsp from 'vscode-languageserver-protocol';

/**
 * CM5 position interface.
 *
 * TODO: Migrate to offset-only mode once `CodeEditor.IPosition`
 * is migrated.
 */
export interface Position {
  /**
   * Line number
   */
  line: number;

  /**
   * Position of character in line
   */
  ch: number;
}

/**
 * is_* attributes are there only to enforce strict interface type checking
 */
export interface ISourcePosition extends Position {
  isSource: true;
}

export interface IEditorPosition extends Position {
  isEditor: true;
}

export interface IVirtualPosition extends Position {
  isVirtual: true;
}

export interface IRootPosition extends ISourcePosition {
  isRoot: true;
}

/**
 * Compare two `Position` variable.
 *
 */
export function isEqual(self: Position, other: Position): boolean {
  return other && self.line === other.line && self.ch === other.ch;
}

/**
 * Given a list of line and an offset from the start, compute the corresponding
 * position in form of line and column number
 *
 * @param offset - number of spaces counted from the start of first line
 * @param  lines - list of lines to compute the position
 * @return  - the position of cursor
 */
export function positionAtOffset(offset: number, lines: string[]): CodeEditorPosition {
  let line = 0;
  let column = 0;
  for (const textLine of lines) {
    // each line has a new line symbol which is accounted for in offset!
    if (textLine.length + 1 <= offset) {
      offset -= textLine.length + 1;
      line += 1;
    } else {
      column = offset;
      break;
    }
  }
  return { line, column };
}

/**
 * Given a list of line and position in form of line and column number,
 * compute the offset from the start of first line.
 * @param position - postion of cursor
 * @param  lines - list of lines to compute the position
 * @param linesIncludeBreaks - should count the line break as space?
 * return - offset number
 */
export function offsetAtPosition(
  position: CodeEditorPosition,
  lines: string[],
  linesIncludeBreaks = false,
): number {
  const breakIncrement = linesIncludeBreaks ? 0 : 1;
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const textLine = lines[i];
    if (position.line > i) {
      offset += textLine.length + breakIncrement;
    } else {
      offset += position.column;
      break;
    }
  }
  return offset;
}

export namespace ProtocolCoordinates {
  /**
   * Check if the position is in the input range
   *
   * @param position - position in form of line and character number.
   * @param  range - range in from of start and end position.
   */
  export function isWithinRange(position: lsp.Position, range: lsp.Range): boolean {
    const { line, character } = position;
    return (
      line >= range.start.line &&
      line <= range.end.line &&
      // need to be non-overlapping see https://github.com/jupyter-lsp/jupyterlab-lsp/issues/628
      (line !== range.start.line || character > range.start.character) &&
      (line !== range.end.line || character <= range.end.character)
    );
  }
}
