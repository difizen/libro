import type { IHeading } from '../toc-protocol.js';
import { HeadingType } from '../toc-protocol.js';

/**
 * HTML heading
 */
export interface IHTMLHeading extends IHeading {
  /**
   * HTML id
   */
  id?: string | null;
}
/**
 * Parse a HTML string for headings.
 *
 * ### Notes
 * The html string is not sanitized - use with caution
 *
 * @param html HTML string to parse
 * @param force Whether to ignore HTML headings with class jp-toc-ignore and tocSkip or not
 * @returns Extracted headings
 */
export function getHTMLHeadings(html: string, type?: HeadingType): IHTMLHeading[] {
  const container: HTMLDivElement = document.createElement('div');
  container.innerHTML = html;

  const headings = new Array<IHTMLHeading>();
  const headers = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  for (const h of headers) {
    const level = parseInt(h.tagName[1], 10);

    headings.push({
      text: h.textContent ?? '',
      level,
      id: h?.getAttribute('id'),
      skip: h.classList.contains('jp-toc-ignore') || h.classList.contains('tocSkip'),
      type: type ?? HeadingType.HTML,
    });
  }
  return headings;
}

export const HTMLMimeType = 'text/html';

/**
 * Returns whether a MIME type corresponds to either HTML.
 *
 * @param mime - MIME type string
 * @returns boolean indicating whether a provided MIME type corresponds to either HTML
 *
 * @example
 * const bool = isHTML('text/html');
 * // returns true
 *
 * @example
 * const bool = isHTML('text/plain');
 * // returns false
 */
export function isHTML(mime: string): boolean {
  return mime === HTMLMimeType;
}
