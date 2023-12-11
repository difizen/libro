// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import type { LanguageIdentifier } from '../lsp.js';
import { positionAtOffset } from '../positioning.js';

import type { IExtractedCode, IForeignCodeExtractor } from './types.js';

/**
 * The code extractor for the raw and markdown text.
 */
export class TextForeignCodeExtractor implements IForeignCodeExtractor {
  constructor(options: TextForeignCodeExtractor.IOptions) {
    this.language = options.language;
    this.standalone = options.isStandalone;
    this.fileExtension = options.file_extension;
    this.cellType = options.cellType;
  }
  /**
   * The foreign language.
   */
  readonly language: LanguageIdentifier;

  /**
   * Should the foreign code be appended (False) to the previously established virtual document of the same language,
   * or is it standalone snippet which requires separate connection?
   */
  readonly standalone: boolean;

  /**
   * Extension of the virtual document (some servers check extensions of files), e.g. 'py' or 'R'.
   */
  readonly fileExtension: string;

  /**
   * The supported cell types.
   */
  readonly cellType: string[];

  /**
   * Test if there is any foreign code in provided code snippet.
   */
  hasForeignCode(code: string, cellType: string): boolean {
    return this.cellType.includes(cellType);
  }

  /**
   * Split the code into the host and foreign code (if any foreign code was detected)
   */
  extractForeignCode(code: string): IExtractedCode[] {
    const lines = code.split('\n');

    const extracts = new Array<IExtractedCode>();

    const foreignCodeFragment = code;

    const start = positionAtOffset(0, lines);
    const end = positionAtOffset(foreignCodeFragment.length, lines);

    extracts.push({
      hostCode: '',
      foreignCode: foreignCodeFragment,
      range: { start, end },
      virtualShift: null,
    });

    return extracts;
  }
}

namespace TextForeignCodeExtractor {
  export interface IOptions {
    /**
     * The foreign language.
     */
    language: string;

    /**
     * Should the foreign code be appended (False) to the previously established virtual document of the same language,
     * or is it standalone snippet which requires separate connection?
     */
    isStandalone: boolean;

    /**
     * Extension of the virtual document (some servers check extensions of files), e.g. 'py' or 'R'.
     */
    file_extension: string;

    /**
     * The supported cell types.
     */
    cellType: string[];
  }
}
