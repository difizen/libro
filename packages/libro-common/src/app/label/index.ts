import { ManaModule } from '../../core/index.js';

import {
  DefaultUriLabelProviderContribution,
  LabelProvider,
  LabelProviderContribution,
} from './label-provider.js';

export * from './label-provider.js';
export const LabelModule = ManaModule.create()
  .contribution(LabelProviderContribution)
  .register(LabelProvider, DefaultUriLabelProviderContribution);
