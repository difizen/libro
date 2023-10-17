import type { PluginWithOptions } from 'markdown-it';
import type State from 'markdown-it/lib/rules_core/state_core.js';
import type Token from 'markdown-it/lib/token.js';

export type RenderHref = (slug: string, state: State) => string;
export type RenderAttrs = (
  slug: string,
  state: State,
) => Record<string, string | number>;

export interface PermalinkOptions {
  class: string;
  symbol: string;
  renderHref: RenderHref;
  renderAttrs: RenderAttrs;
  space: boolean;
  placement: keyof typeof position;
  ariaHidden: boolean;
}

export function renderHref(slug: string) {
  return `#${slug}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function renderAttrs(_slug: string) {
  return {};
}

const commonDefaults: PermalinkOptions = {
  class: 'header-anchor',
  symbol: '#',
  renderHref,
  renderAttrs,
  space: true,
  placement: 'after',
  ariaHidden: false,
};

const permalinkSymbolMeta = {
  isPermalinkSymbol: true,
};

const position = {
  false: 'push',
  true: 'unshift',
  after: 'push',
  before: 'unshift',
} as const;

export type PermalinkGenerator = (
  slug: string,
  opts: Partial<PermalinkOptions>,
  state: State,
  index: number,
) => void;

export const linkInsideHeader: PermalinkGenerator = (slug, options, state, idx) => {
  const opts = { ...commonDefaults, ...options };
  const linkTokens = [
    Object.assign(new state.Token('link_open', 'a', 1), {
      attrs: [
        ...(opts.class ? [['class', opts.class]] : []),
        ['href', opts.renderHref(slug, state)],
        ...(opts.ariaHidden ? [['aria-hidden', 'true']] : []),
        ...Object.entries(opts.renderAttrs(slug, state)),
      ],
    }),
    Object.assign(new state.Token('html_inline', '', 0), {
      content: opts.symbol,
      meta: permalinkSymbolMeta,
    }),
    new state.Token('link_close', 'a', -1),
  ];

  if (opts.space) {
    const space = typeof opts.space === 'string' ? opts.space : ' ';
    const type = typeof opts.space === 'string' ? 'html_inline' : 'text';
    state.tokens[idx + 1].children?.[position[opts.placement]](
      Object.assign(new state.Token(type, '', 0), { content: space }),
    );
  }

  state.tokens[idx + 1].children?.[position[opts.placement]](...linkTokens);
};

//// anchor

interface AnchorOptions {
  level: number;
  slugify: (val: string) => string;
  getTokensText(tokens: Token[]): string;
  uniqueSlugStartIndex: number;
  tabIndex: string | false;
  permalink: PermalinkGenerator;
  permalinkOptions: Partial<PermalinkOptions>;
}

export const slugify = (s: string) =>
  encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'));

function getTokensText(tokens: Token[]) {
  return tokens
    .filter((t) => ['text', 'code_inline'].includes(t.type))
    .map((t) => t.content)
    .join('');
}

function uniqueSlug(
  slug: string,
  slugs: Record<string, boolean>,
  failOnNonUnique: boolean,
  startIndex: number,
) {
  let uniq = slug;
  let i = startIndex;

  if (failOnNonUnique && Object.prototype.hasOwnProperty.call(slugs, uniq)) {
    throw new Error(
      `User defined \`id\` attribute \`${slug}\` is not unique. Please fix it in your Markdown to continue.`,
    );
  } else {
    while (Object.prototype.hasOwnProperty.call(slugs, uniq)) {
      uniq = `${slug}-${i}`;
      i += 1;
    }
  }

  slugs[uniq] = true;

  return uniq;
}

const isLevelSelectedNumber = (selection: number) => (level: number) =>
  level >= selection;
const isLevelSelectedArray = (selection: number[]) => (level: number) =>
  selection.includes(level);

const defaultOptions: AnchorOptions = {
  level: 1,
  slugify,
  uniqueSlugStartIndex: 1,
  tabIndex: '-1',
  getTokensText,
  permalink: linkInsideHeader,
  permalinkOptions: {},
};

/**
 * fork from markdown-it-anchor
 * @param md
 * @param options
 */
export const libroAnchor: PluginWithOptions<Partial<AnchorOptions>> = (md, options) => {
  const opts = { ...defaultOptions, ...options };
  md.core.ruler.push('anchor', (state) => {
    const slugs: Record<string, boolean> = {};
    const tokens = state.tokens;
    const cellId = state.env?.cellId as string | undefined;

    const isLevelSelected = Array.isArray(opts.level)
      ? isLevelSelectedArray(opts.level)
      : isLevelSelectedNumber(opts.level);

    for (let idx = 0; idx < tokens.length; idx++) {
      const token = tokens[idx];

      if (token.type !== 'heading_open') {
        continue;
      }

      if (!isLevelSelected(Number(token.tag.substr(1)))) {
        continue;
      }

      // Aggregate the next token children text.
      const title = opts.getTokensText(tokens[idx + 1].children ?? []);

      let slug = token.attrGet('id');

      if (slug === null) {
        slug = uniqueSlug(opts.slugify(title), slugs, false, opts.uniqueSlugStartIndex);
      } else {
        slug = uniqueSlug(slug, slugs, true, opts.uniqueSlugStartIndex);
      }

      if (cellId) {
        token.attrSet('id', `${cellId}-${slug}`);
      } else {
        token.attrSet('id', slug);
      }

      if (opts.tabIndex !== false) {
        token.attrSet('tabindex', `${opts.tabIndex}`);
      }

      if (typeof opts.permalink === 'function') {
        opts.permalink(slug, opts.permalinkOptions, state, idx);
      }

      // A permalink renderer could modify the `tokens` array so
      // make sure to get the up-to-date index on each iteration.
      idx = tokens.indexOf(token);
    }
  });
};
