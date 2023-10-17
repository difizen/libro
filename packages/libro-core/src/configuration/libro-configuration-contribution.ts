import { ConfigurationContribution } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

import {
  CellSideToolbarVisible,
  CellTopToolbarSetting,
  HeaderToolbarVisible,
  AutoInsertWhenNoCell,
  EnterEditModeWhenAddCell,
  CollapserClickActive,
  MultiSelectionWhenShiftClick,
  RightContentFixed,
} from './libro-configuration.js';

@singleton({ contrib: ConfigurationContribution })
export class LibroConfigurationContribution implements ConfigurationContribution {
  registerConfigurations() {
    return [
      HeaderToolbarVisible,
      CellTopToolbarSetting,
      CellSideToolbarVisible,
      AutoInsertWhenNoCell,
      EnterEditModeWhenAddCell,
      CollapserClickActive,
      MultiSelectionWhenShiftClick,
      RightContentFixed,
    ];
  }
}
