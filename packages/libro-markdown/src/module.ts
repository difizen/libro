import { ManaModule } from '@difizen/libro-common/app';

import { LibroMarkdownSettingContribution } from './config-contribution.js';
import { MarkdownParser } from './markdown-protocol.js';
import { MarkdownRender } from './markdown-render.js';

export const MarkdownModule = ManaModule.create().register(
  MarkdownParser,
  MarkdownRender,
  LibroMarkdownSettingContribution,
);
