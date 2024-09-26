import type { ConfigurationNode } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

export const LibroConfigLinkTargetToBlank: ConfigurationNode<boolean> = {
  id: 'libro.markdown.link.target.to.blank',
  description: l10n.t('markdown的a标签是否另起一页'),
  title: l10n.t('a标签另起一页'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const LibroMarkdownConfiguration = {
  TargetToBlank: LibroConfigLinkTargetToBlank,
};
