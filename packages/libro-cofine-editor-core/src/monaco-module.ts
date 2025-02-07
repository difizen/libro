import {
  EditorHandlerContribution,
  EditorOptionsRegistry,
  LanguageOptionsRegistry,
  LanguageWorkerContribution,
  LanguageWorkerRegistry,
  LazyLoaderRegistry,
  LazyLoaderRegistryContribution,
} from '@difizen/libro-cofine-editor-contribution';
import { Contribution, Module, Syringe } from '@difizen/libro-common/app';

import 'reflect-metadata';
import { DefaultWorkerContribution } from './default-worker-contribution.js';
import {
  E2Editor,
  EditorNode,
  IsDiff,
  LazyCallback,
  MonacoOptions,
} from './e2-editor.js';
import { EditorHanlerRegistry } from './editor-handler-registry.js';
import type { Options } from './editor-provider.js';
import { EditorProvider } from './editor-provider.js';
import {
  InitializeContribution,
  InitializeContributionProvider,
  InitializeProvider,
} from './initialize-provider.js';
import {
  SnippetSuggestContribution,
  SnippetSuggestRegistry,
} from './snippets-suggest-registry.js';
import {
  MixedThemeRegistry,
  ThemeContribution,
  ThemeRegistry,
} from './theme-registry.js';

export const MonacoModule = Module()
  .register(
    {
      token: { token: Contribution.Provider, named: InitializeContribution },
      useDynamic: (ctx) =>
        new InitializeContributionProvider(InitializeContribution, ctx.container),
      lifecycle: Syringe.Lifecycle.singleton,
    },
    InitializeProvider,
    LanguageWorkerRegistry,
    LanguageOptionsRegistry,
    EditorOptionsRegistry,
    DefaultWorkerContribution,
    SnippetSuggestRegistry,
    LazyLoaderRegistry,
    {
      token: MixedThemeRegistry,
      useValue: {},
    },
    ThemeRegistry,
    {
      token: EditorProvider,
      lifecycle: Syringe.Lifecycle.singleton,
      useDynamic: (ctx) => {
        return {
          create: (node: HTMLElement, options: Options, lazyCallback?: () => void) => {
            const child = ctx.container.createChild();
            child.register(EditorNode, { useValue: node });
            child.register(MonacoOptions, { useValue: options });
            child.register(LazyCallback, { useValue: lazyCallback });
            child.register({ token: IsDiff, useValue: false });
            child.register(EditorHanlerRegistry);
            child.register(E2Editor);
            return child.get(E2Editor);
          },
          createDiff: (
            node: HTMLElement,
            options: Options,
            lazyCallback?: () => void,
          ) => {
            const child = ctx.container.createChild();
            child.register(EditorNode, { useValue: node });
            child.register(MonacoOptions, { useValue: options });
            child.register(LazyCallback, { useValue: lazyCallback });
            child.register({ token: IsDiff, useValue: true });
            child.register(EditorHanlerRegistry);
            child.register(E2Editor);
            return child.get(E2Editor);
          },
        };
      },
    },
  )
  // 语言 worker 扩展点
  .contribution(
    LanguageWorkerContribution,
    EditorHandlerContribution,
    ThemeContribution,
    SnippetSuggestContribution,
    LazyLoaderRegistryContribution,
  );

export default MonacoModule;
