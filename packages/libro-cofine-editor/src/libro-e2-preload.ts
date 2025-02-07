import { MonacoEnvironment } from '@difizen/libro-cofine-editor-core';
import type { Syringe } from '@difizen/libro-common/mana-app';
import { Deferred } from '@difizen/libro-common/mana-app';

import { JSONLanguageFeature } from './language/json/module.js';
import { JuliaLanguageFeature } from './language/julia/module.js';
import { PythonLanguageFeature } from './language/python/module.js';
import { RLanguageFeature } from './language/r/module.js';
import { SQLLanguageFeature } from './language/sql/module.js';
import { LibroE2ThemeModule } from './theme/module.js';

export const E2LoadedDeferred = new Deferred<void>();

export const loadE2 = async (libroContainer: Syringe.Container) => {
  // libro and e2 share same container!
  MonacoEnvironment.setContainer(libroContainer);
  await MonacoEnvironment.loadModule(async (container) => {
    const textmate = await import('@difizen/libro-cofine-textmate');
    container.load(textmate.TextmateModule);
    container.load(PythonLanguageFeature);
    container.load(SQLLanguageFeature);
    container.load(JSONLanguageFeature);
    container.load(RLanguageFeature);
    container.load(JuliaLanguageFeature);
    container.load(LibroE2ThemeModule);
  });
  await MonacoEnvironment.init();
  E2LoadedDeferred.resolve();
};
