import type { UriComponents } from '@difizen/monaco-editor-core';
import type { Uri } from 'vscode';

export function asArray<T>(x: T | T[]): T[];
export function asArray<T>(x: T | readonly T[]): readonly T[];
export function asArray<T>(x: T | T[]): T[] {
  return Array.isArray(x) ? x : [x];
}

/**
 * Remove all falsy values from `array`. The original array IS modified.
 */
export function coalesceInPlace<T>(
  array: Array<T | undefined | null>,
): asserts array is Array<T> {
  let to = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i]) {
      array[to] = array[i];
      to += 1;
    }
  }
  array.length = to;
}

export function equals<T>(
  one: ReadonlyArray<T> | undefined,
  other: ReadonlyArray<T> | undefined,
  itemEquals: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean {
  if (one === other) {
    return true;
  }

  if (!one || !other) {
    return false;
  }

  if (one.length !== other.length) {
    return false;
  }

  for (let i = 0, len = one.length; i < len; i++) {
    if (!itemEquals(one[i], other[i])) {
      return false;
    }
  }

  return true;
}

export function illegalArgument(name?: string): Error {
  if (name) {
    return new Error(`Illegal argument: ${name}`);
  } else {
    return new Error('Illegal argument');
  }
}

export interface IRelativePattern {
  /**
   * A base file path to which this pattern will be matched against relatively.
   */
  readonly base: string;

  /**
   * A file glob pattern like `*.{ts,js}` that will be matched on file paths
   * relative to the base path.
   *
   * Example: Given a base of `/home/work/folder` and a file path of `/home/work/folder/index.js`,
   * the file glob pattern will match on `index.js`.
   */
  readonly pattern: string;
}

export interface MarkdownStringTrustedOptions {
  readonly enabledCommands: readonly string[];
}

export interface IMarkdownString {
  readonly value: string;
  readonly isTrusted?: boolean | MarkdownStringTrustedOptions;
  readonly supportThemeIcons?: boolean;
  readonly supportHtml?: boolean;
  readonly baseUri?: UriComponents;
  uris?: { [href: string]: UriComponents };
}

export const enum MarkdownStringTextNewlineStyle {
  Paragraph = 0,
  Break = 1,
}

export class MarkdownString implements IMarkdownString {
  public value: string;
  public isTrusted?: boolean | MarkdownStringTrustedOptions;
  public supportThemeIcons?: boolean;
  public supportHtml?: boolean;
  public baseUri?: Uri;

  constructor(
    value = '',
    isTrustedOrOptions:
      | boolean
      | {
          isTrusted?: boolean | MarkdownStringTrustedOptions;
          supportThemeIcons?: boolean;
          supportHtml?: boolean;
        } = false,
  ) {
    this.value = value;
    if (typeof this.value !== 'string') {
      throw illegalArgument('value');
    }

    if (typeof isTrustedOrOptions === 'boolean') {
      this.isTrusted = isTrustedOrOptions;
      this.supportThemeIcons = false;
      this.supportHtml = false;
    } else {
      this.isTrusted = isTrustedOrOptions.isTrusted ?? undefined;
      this.supportThemeIcons = isTrustedOrOptions.supportThemeIcons ?? false;
      this.supportHtml = isTrustedOrOptions.supportHtml ?? false;
    }
  }

  appendText(
    value: string,
    newlineStyle: MarkdownStringTextNewlineStyle = MarkdownStringTextNewlineStyle.Paragraph,
  ): MarkdownString {
    this.value += escapeMarkdownSyntaxTokens(
      this.supportThemeIcons ? escapeIcons(value) : value,
    ) // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
      .replace(/([ \t]+)/g, (_match, g1) => '&nbsp;'.repeat(g1.length)) // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
      // eslint-disable-next-line no-useless-escape
      .replace(/\>/gm, '\\>') // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
      .replace(
        /\n/g,
        newlineStyle === MarkdownStringTextNewlineStyle.Break ? '\\\n' : '\n\n',
      ); // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.

    return this;
  }

  appendMarkdown(value: string): MarkdownString {
    this.value += value;
    return this;
  }

  appendCodeblock(langId: string, code: string): MarkdownString {
    this.value += `\n${appendEscapedMarkdownCodeBlockFence(code, langId)}\n`;
    return this;
  }

  appendLink(target: Uri | string, label: string, title?: string): MarkdownString {
    this.value += '[';
    this.value += this._escape(label, ']');
    this.value += '](';
    this.value += this._escape(String(target), ')');
    if (title) {
      this.value += ` "${this._escape(this._escape(title, '"'), ')')}"`;
    }
    this.value += ')';
    return this;
  }

  private _escape(value: string, ch: string): string {
    const r = new RegExp(escapeRegExpCharacters(ch), 'g');
    return value.replace(r, (match, offset) => {
      if (value.charAt(offset - 1) !== '\\') {
        return `\\${match}`;
      } else {
        return match;
      }
    });
  }
}

export function isEmptyMarkdownString(
  oneOrMany: IMarkdownString | IMarkdownString[] | null | undefined,
): boolean {
  if (isMarkdownString(oneOrMany)) {
    return !oneOrMany.value;
  } else if (Array.isArray(oneOrMany)) {
    return oneOrMany.every(isEmptyMarkdownString);
  } else {
    return true;
  }
}

export function isMarkdownString(thing: any): thing is IMarkdownString {
  if (thing instanceof MarkdownString) {
    return true;
  } else if (thing && typeof thing === 'object') {
    return (
      typeof (<IMarkdownString>thing).value === 'string' &&
      (typeof (<IMarkdownString>thing).isTrusted === 'boolean' ||
        typeof (<IMarkdownString>thing).isTrusted === 'object' ||
        (<IMarkdownString>thing).isTrusted === undefined) &&
      (typeof (<IMarkdownString>thing).supportThemeIcons === 'boolean' ||
        (<IMarkdownString>thing).supportThemeIcons === undefined)
    );
  }
  return false;
}

export function escapeMarkdownSyntaxTokens(text: string): string {
  // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
  return text.replace(/[\\`*_{}[\]()#+\-!~]/g, '\\$&'); // CodeQL [SM02383] Backslash is escaped in the character class
}

/**
 * @see https://github.com/microsoft/vscode/issues/193746
 */
export function appendEscapedMarkdownCodeBlockFence(code: string, langId: string) {
  const longestFenceLength =
    code.match(/^`+/gm)?.reduce((a, b) => (a.length > b.length ? a : b)).length ?? 0;
  const desiredFenceLength = longestFenceLength >= 3 ? longestFenceLength + 1 : 3;

  // the markdown result
  return [
    `${'`'.repeat(desiredFenceLength)}${langId}`,
    code,
    `${'`'.repeat(desiredFenceLength)}`,
  ].join('\n');
}

export function escapeDoubleQuotes(input: string) {
  return input.replace(/"/g, '&quot;');
}

export function removeMarkdownEscapes(text: string): string {
  if (!text) {
    return text;
  }
  return text.replace(/\\([\\`*_{}[\]()#+\-.!~])/g, '$1');
}

export function parseHrefAndDimensions(href: string): {
  href: string;
  dimensions: string[];
} {
  const dimensions: string[] = [];
  const splitted = href.split('|').map((s) => s.trim());
  href = splitted[0];
  const parameters = splitted[1];
  if (parameters) {
    const heightFromParams = /height=(\d+)/.exec(parameters);
    const widthFromParams = /width=(\d+)/.exec(parameters);
    const height = heightFromParams ? heightFromParams[1] : '';
    const width = widthFromParams ? widthFromParams[1] : '';
    const widthIsFinite = isFinite(parseInt(width));
    const heightIsFinite = isFinite(parseInt(height));
    if (widthIsFinite) {
      dimensions.push(`width="${width}"`);
    }
    if (heightIsFinite) {
      dimensions.push(`height="${height}"`);
    }
  }
  return { href, dimensions };
}

export const iconNameExpression = '[A-Za-z0-9-]+';
export const iconModifierExpression = '~[A-Za-z]+';
const iconsRegex = new RegExp(
  `\\$\\(${iconNameExpression}(?:${iconModifierExpression})?\\)`,
  'g',
); // no capturing groups

const escapeIconsRegex = new RegExp(`(\\\\)?${iconsRegex.source}`, 'g');
export function escapeIcons(text: string): string {
  return text.replace(escapeIconsRegex, (match, escaped) =>
    escaped ? match : `\\${match}`,
  );
}

/**
 * Escapes regular expression characters in a given string
 */
export function escapeRegExpCharacters(value: string): string {
  // eslint-disable-next-line no-useless-escape
  return value.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, '\\$&');
}

interface ResourceMapKeyFn {
  (resource: Uri): string;
}

class ResourceMapEntry<T> {
  constructor(
    readonly uri: Uri,
    readonly value: T,
  ) {}
}

function isEntries<T>(
  arg: ResourceMap<T> | ResourceMapKeyFn | readonly (readonly [Uri, T])[] | undefined,
): arg is readonly (readonly [Uri, T])[] {
  return Array.isArray(arg);
}

export class ResourceMap<T> implements Map<Uri, T> {
  private static readonly defaultToKey = (resource: Uri) => resource.toString();

  readonly [Symbol.toStringTag] = 'ResourceMap';

  private readonly map: Map<string, ResourceMapEntry<T>>;
  private readonly toKey: ResourceMapKeyFn;

  /**
   *
   * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
   */
  constructor(toKey?: ResourceMapKeyFn);

  /**
   *
   * @param other Another resource which this maps is created from
   * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
   */
  constructor(other?: ResourceMap<T>, toKey?: ResourceMapKeyFn);

  /**
   *
   * @param other Another resource which this maps is created from
   * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
   */
  constructor(entries?: readonly (readonly [Uri, T])[], toKey?: ResourceMapKeyFn);

  constructor(
    arg?: ResourceMap<T> | ResourceMapKeyFn | readonly (readonly [Uri, T])[],
    toKey?: ResourceMapKeyFn,
  ) {
    if (arg instanceof ResourceMap) {
      this.map = new Map(arg.map);
      this.toKey = toKey ?? ResourceMap.defaultToKey;
    } else if (isEntries(arg)) {
      this.map = new Map();
      this.toKey = toKey ?? ResourceMap.defaultToKey;

      for (const [resource, value] of arg) {
        this.set(resource, value);
      }
    } else {
      this.map = new Map();
      this.toKey = arg ?? ResourceMap.defaultToKey;
    }
  }

  set(resource: Uri, value: T): this {
    this.map.set(this.toKey(resource), new ResourceMapEntry(resource, value));
    return this;
  }

  get(resource: Uri): T | undefined {
    return this.map.get(this.toKey(resource))?.value;
  }

  has(resource: Uri): boolean {
    return this.map.has(this.toKey(resource));
  }

  get size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  delete(resource: Uri): boolean {
    return this.map.delete(this.toKey(resource));
  }

  forEach(clb: (value: T, key: Uri, map: Map<Uri, T>) => void, thisArg?: any): void {
    if (typeof thisArg !== 'undefined') {
      clb = clb.bind(thisArg);
    }
    for (const [_, entry] of this.map) {
      clb(entry.value, entry.uri, <any>this);
    }
  }

  *values(): IterableIterator<T> {
    for (const entry of this.map.values()) {
      yield entry.value;
    }
  }

  *keys(): IterableIterator<Uri> {
    for (const entry of this.map.values()) {
      yield entry.uri;
    }
  }

  *entries(): IterableIterator<[Uri, T]> {
    for (const entry of this.map.values()) {
      yield [entry.uri, entry.value];
    }
  }

  *[Symbol.iterator](): IterableIterator<[Uri, T]> {
    for (const [, entry] of this.map) {
      yield [entry.uri, entry.value];
    }
  }
}

export const Mimes = Object.freeze({
  text: 'text/plain',
  binary: 'application/octet-stream',
  unknown: 'application/unknown',
  markdown: 'text/markdown',
  latex: 'text/latex',
  uriList: 'text/uri-list',
});

const _simplePattern = /^(.+)\/(.+?)(;.+)?$/;

export function normalizeMimeType(mimeType: string): string;
export function normalizeMimeType(mimeType: string, strict: true): string | undefined;
export function normalizeMimeType(mimeType: string, strict?: true): string | undefined {
  const match = _simplePattern.exec(mimeType);
  if (!match) {
    return strict ? undefined : mimeType;
  }
  // https://datatracker.ietf.org/doc/html/rfc2045#section-5.1
  // media and subtype must ALWAYS be lowercase, parameter not
  return `${match[1].toLowerCase()}/${match[2].toLowerCase()}${match[3] ?? ''}`;
}

/**
 * @returns whether the provided parameter is a JavaScript String or not.
 */
export function isString(str: unknown): str is string {
  return typeof str === 'string';
}

/**
 * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && (<unknown[]>value).every((elem) => isString(elem));
}

/**
 * @returns whether the provided parameter is of type `object` but **not**
 *	`null`, an `array`, a `regexp`, nor a `date`.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isObject(obj: unknown): obj is Object {
  // The method can't do a type cast since there are type (like strings) which
  // are subclasses of any put not positvely matched by the function. Hence type
  // narrowing results in wrong results.
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj) &&
    !(obj instanceof RegExp) &&
    !(obj instanceof Date)
  );
}

/**
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */
export function isNumber(obj: unknown): obj is number {
  return typeof obj === 'number' && !isNaN(obj);
}

export const enum CellEditType {
  Replace = 1,
  Output = 2,
  Metadata = 3,
  CellLanguage = 4,
  DocumentMetadata = 5,
  Move = 6,
  OutputItems = 7,
  PartialMetadata = 8,
  PartialInternalMetadata = 9,
}

export interface NotebookCellMetadata {
  /**
   * custom metadata
   */
  [key: string]: unknown;
}

export interface ICellMetadataEdit {
  editType: CellEditType.Metadata;
  index: number;
  metadata: NotebookCellMetadata;
}

export interface IDocumentMetadataEdit {
  editType: CellEditType.DocumentMetadata;
  metadata: NotebookDocumentMetadata;
}

export type NotebookDocumentMetadata = Record<string, unknown>;

/**
 * Whether the provided mime type is a text stream like `stdout`, `stderr`.
 */
export function isTextStreamMime(mimeType: string) {
  return [
    'application/vnd.code.notebook.stdout',
    'application/vnd.code.notebook.stderr',
  ].includes(mimeType);
}

export interface IRelativePatternDto extends IRelativePattern {
  baseUri: UriComponents;
}

export enum FileSystemProviderErrorCode {
  FileExists = 'EntryExists',
  FileNotFound = 'EntryNotFound',
  FileNotADirectory = 'EntryNotADirectory',
  FileIsADirectory = 'EntryIsADirectory',
  FileExceedsStorageQuota = 'EntryExceedsStorageQuota',
  FileTooLarge = 'EntryTooLarge',
  FileWriteLocked = 'EntryWriteLocked',
  NoPermissions = 'NoPermissions',
  Unavailable = 'Unavailable',
  Unknown = 'Unknown',
}

export function markAsFileSystemProviderError(
  error: Error,
  code: FileSystemProviderErrorCode,
): Error {
  error.name = code ? `${code} (FileSystemError)` : `FileSystemError`;

  return error;
}
