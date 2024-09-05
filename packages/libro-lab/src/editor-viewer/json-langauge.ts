import type { LanguageSpecRegistry } from '@difizen/libro-jupyter';
import { LanguageSpecContribution } from '@difizen/libro-jupyter';
import { singleton } from '@difizen/mana-app';

@singleton({ contrib: [LanguageSpecContribution] })
export class JSONLanguageSpecs implements LanguageSpecContribution {
  registerLanguageSpec = (register: LanguageSpecRegistry) => {
    // register.registerLanguageSpec({
    //   name: 'SQL',
    //   mime: 'application/vnd.libro.sql+json',
    //   language: 'sql-odps',
    //   ext: ['.sql'],
    // });
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
