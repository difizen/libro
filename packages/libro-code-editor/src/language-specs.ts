import type { Contribution } from '@difizen/libro-common/mana-app';
import { ApplicationContribution } from '@difizen/libro-common/mana-app';
import { contrib, singleton, Syringe } from '@difizen/libro-common/mana-app';

export const LanguageSpecContribution = Syringe.defineToken('LanguageSpecContribution');
export interface LanguageSpecContribution {
  registerLanguageSpec: (register: LanguageSpecRegistry) => void;
}
export interface LanguageSpec {
  /**
   * language name
   */
  name: string;
  /**
   * https://code.visualstudio.com/docs/languages/identifiers
   */
  language: string;
  /**
   * https://www.iana.org/assignments/media-types/media-types.xhtml
   */
  mime: string;
  /**
   * file extension
   */
  ext: string[];
}

@singleton({ contrib: [ApplicationContribution] })
export class LanguageSpecRegistry implements ApplicationContribution {
  get languageSpecs(): LanguageSpec[] {
    return this.languageSpecsData;
  }
  protected languageSpecsData: LanguageSpec[] = [];

  protected readonly languageSpecProvider: Contribution.Provider<LanguageSpecContribution>;

  constructor(
    @contrib(LanguageSpecContribution)
    languageSpecProvider: Contribution.Provider<LanguageSpecContribution>,
  ) {
    this.languageSpecProvider = languageSpecProvider;
  }

  initialize() {
    this.languageSpecProvider.getContributions().forEach((item) => {
      item.registerLanguageSpec(this);
    });
  }

  /**
   * 注册语言元信息，代码编辑器根据这些信息来设置语言；使用代码编辑器的cell一般需要注册语言元信息
   */
  registerLanguageSpec(spec: LanguageSpec) {
    const index = this.languageSpecsData.findIndex(
      (item) => item.language === spec.language,
    );
    if (index >= 0) {
      this.languageSpecsData.splice(index, 1, spec);
    } else {
      this.languageSpecsData.push(spec);
    }
  }

  hasLanguage(spec: LanguageSpec) {
    return (
      this.languageSpecsData.findIndex((item) => item.language === spec.language) > 0
    );
  }
}
