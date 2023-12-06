import type { ConfigurationRender } from '@difizen/mana-app';
import { singleton, ConfigurationRenderContribution } from '@difizen/mana-app';

import {
  DefaultCheckbox,
  DefaultInput,
  DefaultInputNumber,
  DefaultSelect,
  DefaultSwitch,
  DefaultDatePicker,
} from './default-node-render.js';

@singleton({ contrib: [ConfigurationRenderContribution] })
export class DefaultConfigurationRenderContribution
  implements ConfigurationRenderContribution
{
  registerConfigurationRenders(): ConfigurationRender[] {
    return [
      {
        canHandle: (config) => {
          if (config.type === 'input') {
            return 1;
          } else {
            return false;
          }
        },
        component: DefaultInput,
      },
      {
        canHandle: (config) => {
          if (config.type === 'checkbox') {
            return 1;
          } else {
            return false;
          }
        },
        component: DefaultCheckbox,
      },
      {
        canHandle: (config) => {
          if (config.type === 'switch') {
            return 1;
          } else {
            return false;
          }
        },
        component: DefaultSwitch,
      },
      {
        canHandle: (config) => {
          if (config.type === 'inputnumber') {
            return 1;
          } else {
            return false;
          }
        },
        component: DefaultInputNumber,
      },
      {
        canHandle: (config) => {
          if (config.type === 'select') {
            return 1;
          } else {
            return false;
          }
        },
        component: DefaultSelect,
      },
      {
        canHandle: (config) => {
          if (config.type === 'datepicker') {
            return 1;
          } else {
            return false;
          }
        },
        component: DefaultDatePicker,
      },
    ];
  }
}
