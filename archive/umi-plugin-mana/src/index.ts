import type { IApi } from 'umi';

import decoratorPlugin from './decorator';
import manaRuntimePlugin from './mana-runtime';
import nodenextPlugin from './nodenext';
import routerBasePlugin from './router-base';

export default (api: IApi) => {
  api.describe({
    key: 'mana',
    config: {
      default: {},
      schema: (joi) =>
        joi
          .object({
            decorator: joi.boolean(),
            routerBase: joi.boolean(),
            nodenext: joi.boolean(),
            runtime: joi.boolean(),
          })
          .default({}),

      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });
  const config = api.userConfig['mana'];

  if (config.decorator) {
    decoratorPlugin(api);
  }

  if (config.nodenext) {
    nodenextPlugin(api);
  }

  if (config.routerBase) {
    routerBasePlugin(api);
  }

  if (config.runtime) {
    manaRuntimePlugin(api);
  }
};
