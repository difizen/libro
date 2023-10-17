import type { ConfigurationNode } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

export const LibroAutosaveSetting: ConfigurationNode<boolean> = {
  id: 'libro.autosave',

  description: l10n.t('是否自动保存修改'),
  title: 'checkbox',
  type: 'checkbox',
  defaultValue: false,
  schema: {
    type: 'boolean',
  },
};
