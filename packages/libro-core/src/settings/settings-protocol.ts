import type { ConfigurationStorage } from '@difizen/libro-common/app';

export const LibroUserSettingsNamespace = 'libro.user';
export const LibroUserSettingStorage: ConfigurationStorage = {
  id: '__libro.user.storage__',
  priority: 100,
};
