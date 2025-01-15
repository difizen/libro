import type { ConfigurationNode } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import {
  ConfigurationContribution,
  ConfigurationService,
  ApplicationContribution,
} from '@difizen/mana-app';

import {
  DemoBooleanConfig,
  DemoDateConfig,
  DemoNumberConfig,
  DemoSelectConfig,
  DemoStringConfig,
  DemoSwitchConfig,
  FontSize,
  InsertSpaces,
  LineHeight,
  LineWarp,
  LSPEnabled,
  TabSize,
  WordWrapColumn,
} from './configs.js';

@singleton({ contrib: [ConfigurationContribution, ApplicationContribution] })
export class DefaultConfigurationContribution
  implements ConfigurationContribution, ApplicationContribution
{
  @inject(ConfigurationService)
  protected readonly configurationService: ConfigurationService;

  async onViewStart() {
    /**
     * 改变初始配置
     */
    // await this.configurationService.set(DemoBooleanConfig, true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerConfigurations(): ConfigurationNode<any>[] {
    return [
      FontSize,
      TabSize,
      InsertSpaces,
      LineHeight,
      LineWarp,
      WordWrapColumn,
      LSPEnabled,
      DemoStringConfig,
      DemoNumberConfig,
      DemoBooleanConfig,
      DemoSelectConfig,
      DemoSwitchConfig,
      DemoDateConfig,
    ];
  }
}
