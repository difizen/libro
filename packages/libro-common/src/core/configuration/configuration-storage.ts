export interface ConfigurationStorage {
  /**
   * unique id
   */
  id: string;
  /**
   * get value priority
   */
  priority: number;
}

/**
 * 内存存储
 */
export const DefaultConfigurationStorage: ConfigurationStorage = {
  id: '__default_configuration_storage',
  priority: 0,
};

/**
 * localstorage 存储
 */
export const LocalConfigurationStorage: ConfigurationStorage = {
  id: '__local_configuration_storage',
  priority: 1,
};
