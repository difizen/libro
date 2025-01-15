import { ManaModule } from '../module';

import { ConfigurationCache } from './configuration-cache';
import {
  ConfigurationProvider,
  DefaultConfigurationProvider,
  LocalStorageConfigurationProvider,
} from './configuration-provider';
import {
  ConfigurationContribution,
  ConfigurationRegistry,
} from './configuration-registry';
import {
  ConfigurationRenderContribution,
  ConfigurationRenderRegistry,
} from './configuration-render-registry';
import { ConfigurationService } from './configuration-service';
import { SchemaValidator } from './validation';

export const ConfigurationModule = ManaModule.create()
  .contribution(
    ConfigurationProvider,
    ConfigurationContribution,
    ConfigurationRenderContribution,
  )
  .register(
    ConfigurationService,
    DefaultConfigurationProvider,
    LocalStorageConfigurationProvider,
    ConfigurationRegistry,
    ConfigurationRenderRegistry,
    SchemaValidator,
    ConfigurationCache,
  );
