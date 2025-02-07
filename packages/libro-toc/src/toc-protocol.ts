import type { CellView } from '@difizen/libro-core';
import type { View } from '@difizen/libro-common/mana-app';
import type { Disposable } from '@difizen/libro-common/mana-app';
import { Syringe } from '@difizen/libro-common/mana-app';

/**
 * Table of Contents configuration
 *
 * #### Notes
 * A document model may ignore some of those options.
 */
export interface TOCOptions {
  /**
   * Base level for the highest headings
   */
  baseNumbering: number;
  /**
   * Maximal depth of headings to display
   */
  maximalDepth: number;
  /**
   * Whether to number first-level headings or not.
   */
  numberingH1: boolean;
  /**
   * Whether to number headings in document or not.
   */
  numberHeaders: boolean;
  /**
   * Whether to include cell outputs in headings or not.
   */
  includeOutput: boolean;
  /**
   * Whether to synchronize heading collapse state between the ToC and the document or not.
   */
  syncCollapseState: boolean;
}

/**
 * Default table of content configuration
 */
export const defaultTocConfig: TOCOptions = {
  baseNumbering: 1,
  maximalDepth: 4,
  numberingH1: true,
  numberHeaders: false,
  includeOutput: true,
  syncCollapseState: false,
};

/**
 * Interface describing a heading.
 */
export interface IHeading {
  /**
   * Type of heading
   */
  type: HeadingType;

  /**
   * Heading text.
   */
  text: string;

  /**
   * HTML heading level.
   */
  level: number;

  /**
   * Heading prefix.
   */
  prefix?: string | null;

  /**
   * Dataset to add to the item node
   */
  dataset?: Record<string, string>;

  /**
   * Whether the heading is marked to skip or not
   */
  skip?: boolean;

  /**
   * Index of the output containing the heading
   */
  outputIndex?: number;

  /**
   * HTML id
   */
  id?: string | null;
}

/**
 * Type of headings
 */
export enum HeadingType {
  /**
   * Heading from HTML output
   */
  HTML,
  /**
   * Heading from Markdown cell or Markdown output
   */
  Markdown,
}

export interface CellTOCProvider {
  getHeadings: () => IHeading[];
  updateWatcher: (fn: () => void) => Disposable;
}

export interface CellTOCProviderContribution {
  canHandle: (cell: CellView) => number;
  factory: (cell: CellView) => CellTOCProvider;
}

export const CellTOCProviderContribution = Syringe.defineToken(
  'CellTOCProviderContribution',
);

export interface TOCProviderOption {
  /**
   * libro view
   */
  view: View;
}
export const TOCProviderOption = Symbol('TOCProviderOption');
