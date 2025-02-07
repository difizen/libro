import type { LanguageSpecRegistry } from '@difizen/libro-jupyter';
import { LanguageSpecContribution } from '@difizen/libro-jupyter';
import { singleton } from '@difizen/libro-common/app';

@singleton({ contrib: [LanguageSpecContribution] })
export class JuliaLanguageSpecs implements LanguageSpecContribution {
  registerLanguageSpec = (register: LanguageSpecRegistry) => {
    register.registerLanguageSpec({
      name: 'JULIA',
      language: 'julia',
      mime: 'text/x-julia',
      ext: ['.jl', '.JL'],
    });
  };
}
