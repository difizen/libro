import { ManaModule } from '../module';

import { CommandRegistry, CommandContribution } from './command-registry';

export * from './command-registry';
export * from './command-protocol';

export const CommandModule = ManaModule.create()
  .contribution(CommandContribution)
  .register(CommandRegistry);
