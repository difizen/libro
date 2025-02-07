import type { LanguageSpecRegistry } from '@difizen/libro-jupyter';
import { LanguageSpecContribution } from '@difizen/libro-jupyter';
import { singleton } from '@difizen/libro-common/app';

@singleton({ contrib: [LanguageSpecContribution] })
export class RLanguageSpecs implements LanguageSpecContribution {
  registerLanguageSpec = (register: LanguageSpecRegistry) => {
    register.registerLanguageSpec({
      name: 'R',
      language: 'r',
      mime: 'text/x-r-source',
      ext: ['.r', '.R'],
    });
  };
}
