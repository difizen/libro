import type { Contribution } from '@difizen/mana-app';
import { ApplicationContribution } from '@difizen/mana-app';
import { contrib, inject, singleton, Syringe } from '@difizen/mana-app';

import type { LibroE2Editor, LibroE2EditorConfig } from './libro-e2-editor.js';
import { LibroSQLRequestAPI } from './libro-sql-api.js';

export const LanguageSpecContribution = Syringe.defineToken('LanguageSpecContribution');
export interface LanguageSpecContribution {
  registerLanguageSpec: (register: LanguageSpecRegistry) => void;
}
export interface LanguageSpec {
  name: string;
  language: string;
  mime: string;
  ext: string[];
  loadModule?: (container: Syringe.Container) => Promise<void>;
  beforeEditorInit?: () => Promise<void>;
  editorConfig?: Partial<LibroE2EditorConfig>;
  afterEditorInit?: (editor: LibroE2Editor) => Promise<void>;
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

@singleton({ contrib: [LanguageSpecContribution] })
export class LibroLanguageSpecs implements LanguageSpecContribution {
  @inject(LibroSQLRequestAPI)
  protected readonly dataphinAPI: LibroSQLRequestAPI;

  registerLanguageSpec = (register: LanguageSpecRegistry) => {
    register.registerLanguageSpec({
      name: 'Python',
      language: 'python',
      ext: ['.py'],
      mime: 'text/x-python',
      editorConfig: {},
    });
    register.registerLanguageSpec({
      name: 'SQL',
      mime: 'application/vnd.libro.sql+json',
      language: 'sql-odps',
      ext: ['.sql'],
      editorConfig: {},
      beforeEditorInit: async () => {
        //
      },
    });
    register.registerLanguageSpec({
      name: 'Markdown',
      language: 'markdown',
      mime: 'text/x-markdown',
      ext: ['.md', '.markdown', '.mkd', '.sh'],
    });
    register.registerLanguageSpec({
      name: 'Prompt',
      language: 'prompt',
      mime: 'application/vnd.libro.prompt+json',
      ext: [],
    });
    register.registerLanguageSpec({
      name: 'JSON',
      language: 'json',
      mime: 'application/json',
      ext: [
        '.json',
        '.bowerrc',
        '.jshintrc',
        '.jscsrc',
        '.eslintrc',
        '.babelrc',
        '.har',
      ],
    });
  };
}
