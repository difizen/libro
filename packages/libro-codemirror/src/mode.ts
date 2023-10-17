import { markdown } from '@codemirror/lang-markdown';
import type { LanguageSupport } from '@codemirror/language';
import { LanguageDescription } from '@codemirror/language';
import { defaultMimeType } from '@difizen/libro-code-editor';

// This ensures the language spec for python will be loaded when
// we instantiate a new editor instance, which is required since
// python is the default language and we don't want to split
// the editor constructor because of asynchronous loading.
import { PathExt } from '@difizen/libro-common';
import { highlightTree } from '@lezer/highlight';

import { python } from './python-lang.js';
import { jupyterHighlightStyle } from './theme.js';

/**
 * The interface of a codemirror language spec.
 */
export interface ISpec {
  name: string;
  alias?: readonly string[];
  mime: string | readonly string[];
  load?: () => Promise<LanguageSupport>;
  extensions?: readonly string[];
  filename?: RegExp;
  support?: LanguageSupport;
}

// Code mirror uses two similar structures, a plain object with optional fields,
// and a class with the same fields but all mandatory. Maybe adopting the same
// pattern would be less confusing (although far more verbose)
function makeSpec(spec: ISpec): ISpec {
  const res = LanguageDescription.of(spec) as unknown as ISpec;
  res.mime = spec.mime;
  return res;
}

const modeList: ISpec[] = [
  makeSpec({
    name: 'Python',
    mime: 'text/x-python',
    extensions: ['BUILD', 'bzl', 'py', 'pyw'],
    filename: /^(BUCK|BUILD)$/,
    load() {
      return Promise.resolve(python());
    },
  }),
  makeSpec({
    name: 'Markdown',
    mime: 'text/x-markdown',
    extensions: ['md', 'markdown', 'mkd'],
    async load() {
      return Promise.resolve(markdown());
    },
  }),
];

/**
 * Get the raw list of available modes specs.
 *
 * @alpha
 * @returns The available modes
 */
export function getModeInfo(): ISpec[] {
  return modeList;
}

/**
 * Find a codemirror mode by MIME.
 *
 * @alpha
 * @param mime Mime type to look for
 * @returns The mode or null
 */
export function findByMIME(mime: string | readonly string[]): ISpec | null {
  if (Array.isArray(mime)) {
    for (let i = 0; i < mime.length; i++) {
      const spec = findByMIME(mime[i]);
      if (spec) {
        return spec;
      }
    }
    return null;
  }
  const _mime = (mime as string).toLowerCase();
  for (let i = 0; i < modeList.length; i++) {
    const info = modeList[i];
    if (Array.isArray(info.mime)) {
      for (let j = 0; j < info.mime.length; j++) {
        if (info.mime[j] === _mime) {
          return info;
        }
      }
    } else if (info.mime === _mime) {
      return info;
    }
  }
  if (/\+xml$/.test(_mime)) {
    return findByMIME('application/xml');
  }
  if (/\+json$/.test(_mime)) {
    return findByMIME('application/json');
  }
  return null;
}

/**
 * Find a codemirror mode by name.
 *
 * @alpha
 * @param name The mode name
 * @returns The mode or null
 */
export function findByName(name: string): ISpec | null {
  const _name = name.toLowerCase();
  for (let i = 0; i < modeList.length; i++) {
    const info = modeList[i];
    if (info.name.toLowerCase() === _name) {
      return info;
    }
    if (info.alias) {
      for (let j = 0; j < info.alias.length; j++) {
        if (info.alias[j].toLowerCase() === _name) {
          return info;
        }
      }
    }
  }
  return null;
}

/**
 * Find a codemirror mode by extension.
 *
 * @alpha
 * @param ext The extension name
 * @returns The mode or null
 */
export function findByExtension(ext: string | readonly string[]): ISpec | null {
  if (Array.isArray(ext)) {
    for (let i = 0; i < ext.length; i++) {
      const spec = findByExtension(ext[i]);
      if (spec) {
        return spec;
      }
    }
    return null;
  }
  const _ext = (ext as string).toLowerCase();
  for (let i = 0; i < modeList.length; i++) {
    const info = modeList[i];
    for (let j = 0; j < info.extensions!.length; j++) {
      if (info.extensions![j].toLowerCase() === _ext) {
        return info;
      }
    }
  }
  return null;
}

/**
 * Find a codemirror mode by filename.
 *
 * @param name File name
 * @returns The mode or null
 */
export function findByFileName(name: string): ISpec | null {
  const basename = PathExt.basename(name);
  for (let i = 0; i < modeList.length; i++) {
    const info = modeList[i];
    if (info.filename && info.filename.test(basename)) {
      return info;
    }
  }
  const dot = basename.lastIndexOf('.');
  const ext = dot > -1 && basename.substring(dot + 1, basename.length);
  if (ext) {
    return findByExtension(ext);
  }
  return null;
}

/**
 * Find a codemirror mode by name or CodeMirror spec.
 *
 * @alpha
 * @param mode The CodeMirror mode
 * @param fallback Whether to fallback to default mimetype spec or not
 * @returns The mode or null
 */
export function findBest(mode: string | ISpec, fallback = true): ISpec | null {
  const modename = typeof mode === 'string' ? mode : mode.name;
  const mimetype = typeof mode !== 'string' ? mode.mime : modename;
  const ext = typeof mode !== 'string' ? mode.extensions ?? [] : [];

  return (
    (modename ? findByName(modename) : null) ??
    (mimetype ? findByMIME(mimetype) : null) ??
    findByExtension(ext) ??
    (fallback ? findByMIME(defaultMimeType) : null)
  );
}

/**
 * Ensure a codemirror mode is available by name or Codemirror spec.
 *
 * @param mode - The mode to ensure.  If it is a string, uses [findBest]
 *   to get the appropriate spec.
 *
 * @returns A promise that resolves when the mode is available.
 */
export async function ensure(mode: string | ISpec): Promise<ISpec | null> {
  const spec = findBest(mode);
  if (spec) {
    spec.support = await spec.load!();
    return spec;
  }
  return null;
}

/**
 * Register a new mode for CodeMirror
 *
 * @alpha
 * @param mode Mode to register
 */
export function registerModeInfo(mode: ISpec): void {
  const info = findBest(mode, false);
  if (info) {
    throw new Error(`${mode.mime} already registered`);
  }
  modeList.push(makeSpec(mode));
}

/**
 * Parse and style a string.
 *
 * @alpha
 * @param code Code to highlight
 * @param mode Code mode
 * @param el HTML element into which the highlighted code will be inserted
 */
export function run(code: string, mode: ISpec, el: HTMLElement): void {
  const language = mode.support?.language;
  if (!language) {
    return;
  }

  const tree = language.parser.parse(code);
  // position state required because unstyled tokens are not emitted
  // in highlightTree
  let pos = 0;
  highlightTree(tree, jupyterHighlightStyle, (from, to, classes) => {
    if (from > pos) {
      // No style applied to the token between pos and from
      el.appendChild(document.createTextNode(code.slice(pos, from)));
    }
    const sp = el.appendChild(document.createElement('span'));
    sp.className = classes;
    sp.appendChild(document.createTextNode(code.slice(from, to)));
    pos = to;
  });

  if (pos < tree.length - 1) {
    // No style applied on the trailing text
    el.appendChild(document.createTextNode(code.slice(pos, tree.length)));
  }
}
// }
