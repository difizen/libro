import { useInject } from '@difizen/mana-observable';
import { useCallback, useEffect, useState } from 'react';

import type { ConfigurationNode } from './configuration-protocol';
import { ConfigurationService } from './configuration-service';

export const useConfigurationValue = <T>(node: ConfigurationNode<T>) => {
  const configurationService = useInject(ConfigurationService);
  const [value, setValue] = useState<T>(node.defaultValue);

  const setConfig = useCallback(
    (updateValue: T) => {
      configurationService.set(node, updateValue);
    },
    [configurationService, node],
  );

  useEffect(() => {
    (async () => {
      const hasValue = await configurationService.has(node);
      if (hasValue) {
        const val = await configurationService.get(node);
        setValue(val);
      }
    })();
  }, [configurationService, node]);

  useEffect(() => {
    const disposable = configurationService.onConfigurationValueChange((event) => {
      if (event.key === node.id) {
        setValue(event.value);
      }
    });

    return () => disposable.dispose();
  }, [configurationService, node.id]);

  return [value, setConfig] as const;
};
