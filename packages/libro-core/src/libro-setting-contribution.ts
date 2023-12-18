import { singleton, ConfigurationContribution } from '@difizen/mana-app';

import {
  AutoInsertWhenNoCell,
  CellSideToolbarVisible,
  CellTopToolbarSetting,
  CollapserClickActive,
  EnterEditModeWhenAddCell,
  HeaderToolbarVisible,
  MultiSelectionWhenShiftClick,
  RightContentFixed,
} from './libro-setting.js';

@singleton({ contrib: ConfigurationContribution })
export class LibroSettingContribution implements ConfigurationContribution {
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
