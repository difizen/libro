import { postConstruct, singleton } from '@difizen/mana-app';
import MarkdownIt from 'markdown-it';

import { libroAnchor, linkInsideHeader, slugify } from './anchor.js';
import type { MarkdownRenderOption } from './markdown-protocol.js';
import { MarkdownParser } from './markdown-protocol.js';

@singleton({ token: MarkdownParser })
export class MarkdownRender implements MarkdownParser {
  protected mkt: MarkdownIt;
  slugify = slugify;
  enablePermalink = false;

  @postConstruct()
  init() {
    this.mkt = new MarkdownIt({
      html: true,
      linkify: true,
    });
    this.mkt.linkify.set({ fuzzyLink: false });
    this.mkt.use(libroAnchor, {
      permalinkOptions: { class: 'libro-InternalAnchorLink', space: false },
      permalink: this.enablePermalink ? linkInsideHeader : false,
      slugify: this.slugify,
    });
  }

  render(markdownText: string, options?: MarkdownRenderOption): string {
    const unsanitizedRenderedMarkdown = this.mkt.render(markdownText, options);
    return unsanitizedRenderedMarkdown;
  }
}
