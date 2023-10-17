export const MarkdownParser = Symbol('MarkdownParser');

export interface MarkdownRenderOption {
  cellId?: string;
}

/**
 * The interface for a Markdown parser.
 */
export interface MarkdownParser {
  /**
   * Render a markdown source.
   *
   * @param source - The string to render.
   * @returns - string.
   */
  render(source: string, options?: MarkdownRenderOption): string;

  slugify: (val: string) => string;
}
