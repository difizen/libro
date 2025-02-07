import type { Contribution } from '@difizen/libro-common/mana-app';
import { contrib, singleton, Syringe } from '@difizen/libro-common/mana-app';

export const LanguageWorkerContribution = Syringe.defineToken(
  'LanguageWorkerContribution',
);
export interface LanguageWorkerContribution {
  registerLanguageWorkers: (registry: LanguageWorkerRegistry) => void;
}

export interface LanguageWorkerConfig {
  language: string;
  priority?: number;
  getWorkerUrl: (language: string, moduleId?: string) => string;
}

@singleton()
export class LanguageWorkerRegistry {
  protected configs: LanguageWorkerConfig[] = [];
  protected readonly provider: Contribution.Provider<LanguageWorkerContribution>;
  constructor(
    @contrib(LanguageWorkerContribution)
    provider: Contribution.Provider<LanguageWorkerContribution>,
  ) {
    this.provider = provider;
    this.provider.getContributions().forEach((contribution) => {
      contribution.registerLanguageWorkers(this);
    });
  }

  registerWorker(config: LanguageWorkerConfig) {
    const conf = {
      ...config,
      language: config.language.toUpperCase(),
    };
    if (this.configs.find((c) => c.language === conf.language)) {
      console.warn(
        `Language ${conf.language} has already registed, this will overwrite the previous configuration`,
      );
    }
    this.configs = [...this.configs, conf].sort((a, b) => {
      const aPriority = a.priority || 100;
      const bPriority = b.priority || 100;
      return bPriority - aPriority;
    });
  }

  getLanguageWorker(language: string, moduleId?: string): string | undefined {
    this.configs = [];
    this.provider.getContributions({ cache: false }).forEach((contribution) => {
      contribution.registerLanguageWorkers(this);
    });
    const config = this.getLanguageConfig(language);
    if (config) {
      return config.getWorkerUrl(language, moduleId);
    }
    return undefined;
  }
  getLanguageConfig(language: string): LanguageWorkerConfig | undefined {
    return this.configs.find(
      (item) => item.language.toUpperCase() === language.toUpperCase(),
    );
  }
}
