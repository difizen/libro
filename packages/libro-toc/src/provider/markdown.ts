import type { IHeading } from '../toc-protocol.js';
import { HeadingType } from '../toc-protocol.js';

interface IHeader {
  /**
   * Heading text.
   */
  text: string;

  /**
   * Heading level.
   */
  level: number;

  /**
   * Raw string containing the heading
   */
  raw: string;

  /**
   * Whether the heading is marked to skip or not
   */
  skip: boolean;
}

/**
 * Markdown heading
 */
export interface IMarkdownHeading extends IHeading {
  /**
   * Heading line
   */
  line: number;
}

/**
 * Parses the provided string and returns a list of headings.
 *
 * @param text - Input text
 * @returns List of headings
 */
export function getHeadings(text: string): IMarkdownHeading[] {
  // Split the text into lines:
  const lines = text.split('\n');

  // Iterate over the lines to get the header level and text for each line:
  const headings = new Array<IMarkdownHeading>();
  let isCodeBlock;
  let lineIdx = 0;

  // Don't check for Markdown headings if in a YAML frontmatter block.
  // We can only start a frontmatter block on the first line of the file.
  // At other positions in a markdown file, '---' represents a horizontal rule.
  if (lines[lineIdx] === '---') {
    // Search for another '---' and treat that as the end of the frontmatter.
    // If we don't find one, treat the file as containing no frontmatter.
    for (
      let frontmatterEndLineIdx = lineIdx + 1;
      frontmatterEndLineIdx < lines.length;
      frontmatterEndLineIdx++
    ) {
      if (lines[frontmatterEndLineIdx] === '---') {
        lineIdx = frontmatterEndLineIdx + 1;
        break;
      }
    }
  }

  for (; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    if (line === '') {
      // Bail early
      continue;
    }

    // Don't check for Markdown headings if in a code block
    if (line.startsWith('```')) {
      isCodeBlock = !isCodeBlock;
    }
    if (isCodeBlock) {
      continue;
    }

    const heading = parseHeading(line, lines[lineIdx + 1]); // append the next line to capture alternative style Markdown headings

    if (heading) {
      headings.push({
        ...heading,
        line: lineIdx,
        type: HeadingType.Markdown,
      });
    }
  }
  return headings;
}

/**
 * Whether a MIME type corresponds to a Markdown flavor.
 */
export function isMarkdown(mime: string): boolean {
  return [
    'text/x-ipythongfm',
    'text/x-markdown',
    'text/x-gfm',
    'text/markdown',
  ].includes(mime);
}

/**
 * Ignore title with html tag with a class name equal to `jp-toc-ignore` or `tocSkip`
 */
const skipHeading =
  /<\w+\s(.*?\s)?class="(.*?\s)?(jp-toc-ignore|tocSkip)(\s.*?)?"(\s.*?)?>/;

/**
 * Parses a heading, if one exists, from a provided string.
 * @param line - Line to parse
 * @param nextLine - The line after the one to parse
 * @returns heading info
 *
 * @example
 * ### Foo
 * const out = parseHeading('### Foo\n');
 * // returns {'text': 'Foo', 'level': 3}
 *
 * @example
 * const out = parseHeading('Foo\n===\n');
 * // returns {'text': 'Foo', 'level': 1}
 *
 * @example
 * <h4>Foo</h4>
 * const out = parseHeading('<h4>Foo</h4>\n');
 * // returns {'text': 'Foo', 'level': 4}
 *
 * @example
 * const out = parseHeading('Foo');
 * // returns null
 */
function parseHeading(line: string, nextLine?: string): IHeader | null {
  // Case: Markdown heading
  let match = line.match(/^([#]{1,6}) (.*)/);
  if (match) {
    return {
      text: cleanTitle(match[2]),
      level: match[1].length,
      raw: line,
      skip: skipHeading.test(match[0]),
    };
  }
  // Case: Markdown heading (alternative style)
  if (nextLine) {
    match = nextLine.match(/^ {0,3}([=]{2,}|[-]{2,})\s*$/);
    if (match) {
      return {
        text: cleanTitle(line),
        level: match[1][0] === '=' ? 1 : 2,
        raw: [line, nextLine].join('\n'),
        skip: skipHeading.test(line),
      };
    }
  }
  // Case: HTML heading (WARNING: this is not particularly robust, as HTML headings can span multiple lines)
  match = line.match(/<h([1-6]).*>(.*)<\/h\1>/i);
  if (match) {
    return {
      text: match[2],
      level: parseInt(match[1], 10),
      skip: skipHeading.test(match[0]),
      raw: line,
    };
  }

  return null;
}

function cleanTitle(heading: string): string {
  // take special care to parse Markdown links into raw text
  return heading.replace(/\[(.+)\]\(.+\)/g, '$1');
}

export const MarkdownMimeType = 'text/markdown';
