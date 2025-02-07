import { ManaModule } from '../../mana-core/index.js';

import {
  DefaultUriLabelProviderContribution,
  LabelProvider,
  LabelProviderContribution,
} from './label-provider';

export * from './label-provider';
export const LabelModule = ManaModule.create()
  .contribution(LabelProviderContribution)
  .register(LabelProvider, DefaultUriLabelProviderContribution);
