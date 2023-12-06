import type { ConfigurationStorage } from '@difizen/mana-app';

export const LibroUserSettingsNamespace = 'libro.user';
export const LibroUserSettingStorage: ConfigurationStorage = {
  id: '__libro.user.storage__',
  priority: 100,
};
