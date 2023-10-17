import { ManaModule } from '@difizen/mana-app';

import { MarkdownParser } from './markdown-protocol.js';
import { MarkdownRender } from './markdown-render.js';

export const MarkdownModule = ManaModule.create().register(
  MarkdownParser,
  MarkdownRender,
);
