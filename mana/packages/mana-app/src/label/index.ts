import { ManaModule } from '@difizen/mana-core';

import {
  DefaultUriLabelProviderContribution,
  LabelProvider,
  LabelProviderContribution,
} from './label-provider';

export * from './label-provider';
export const LabelModule = ManaModule.create()
  .contribution(LabelProviderContribution)
  .register(LabelProvider, DefaultUriLabelProviderContribution);
