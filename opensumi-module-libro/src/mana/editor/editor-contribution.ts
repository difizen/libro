import type { CodeEditorFactory } from '@difizen/libro-code-editor';
import {
  CodeEditorContribution,
  LanguageSpecRegistry,
} from '@difizen/libro-code-editor';
import type { EditorStateFactory } from '@difizen/libro-jupyter';
import { inject, singleton } from '@difizen/mana-app';
import type { Injector } from '@opensumi/di';

import { OpensumiInjector } from '../../common';

import type { OpensumiEditorState } from './opensumi-editor';
import {
  libroOpensumiEditorDefaultConfig,
  LibroOpensumiEditorFactory,
  stateFactory,
} from './opensumi-editor';

@singleton({ contrib: [CodeEditorContribution] })
export class LibroE2EditorContribution implements CodeEditorContribution {
  @inject(LanguageSpecRegistry)
  protected readonly languageSpecRegistry: LanguageSpecRegistry;

  factory: CodeEditorFactory;

  stateFactory: EditorStateFactory<OpensumiEditorState>;

  defaultConfig = libroOpensumiEditorDefaultConfig;

  constructor(
    @inject(LibroOpensumiEditorFactory)
    libroOpensumiEditorFactory: LibroOpensumiEditorFactory,
    @inject(OpensumiInjector) injector: Injector,
  ) {
    this.factory = libroOpensumiEditorFactory;
    this.stateFactory = stateFactory(injector);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandle(mime: string): number {
    // 代码编辑都使用opensumi编辑器
    return 50 + 2;
  }
}
