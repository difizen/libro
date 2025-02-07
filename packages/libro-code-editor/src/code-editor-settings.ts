import {
  inject,
  singleton,
  ApplicationContribution,
  DisposableCollection,
  Emitter,
  ConfigurationContribution,
  ConfigurationService,
} from '@difizen/mana-app';
import type {
  Disposable,
  ConfigurationNode,
  ConfigurationStorage,
} from '@difizen/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';

import type { IEditorConfig } from './code-editor-protocol.js';
import { defaultConfig } from './code-editor-protocol.js';

declare global {
  interface ObjectConstructor {
    typedKeys<T>(obj: T): (keyof T)[];
  }
}
Object.typedKeys = Object.keys as any;

const LibroUserSettingStorage: ConfigurationStorage = {
  id: '__libro.user.storage__',
  priority: 100,
};

const FontSize: ConfigurationNode<number> = {
  id: 'libro.user.codeeditor.fontsize',
  description: l10n.t('代码编辑区域字体大小'),
  title: l10n.t('代码字号'),
  type: 'inputnumber',
  defaultValue: defaultConfig.fontSize ?? 13,
  schema: {
    type: 'number',
  },
  storage: LibroUserSettingStorage,
};

const LineHeight: ConfigurationNode<number> = {
  id: 'libro.user.codeeditor.lineheight',
  description: l10n.t('代码编辑区域字体行高'),
  title: l10n.t('代码行高'),
  type: 'inputnumber',
  defaultValue: defaultConfig.lineHeight ?? 20,
  schema: {
    type: 'number',
  },
  storage: LibroUserSettingStorage,
};

const TabSize: ConfigurationNode<number> = {
  id: 'libro.user.codeeditor.tabsize',
  description: l10n.t('tab转换为几个空格大小'),
  title: l10n.t('tab大小'),
  type: 'inputnumber',
  defaultValue: defaultConfig.tabSize ?? 4,
  schema: {
    type: 'number',
  },
  storage: LibroUserSettingStorage,
};

const InsertSpaces: ConfigurationNode<boolean> = {
  id: 'libro.user.codeeditor.insertspaces',
  description: l10n.t('输入tab是否转换为空格'),
  title: l10n.t('tab转空格'),
  type: 'checkbox',
  defaultValue: defaultConfig.insertSpaces,
  schema: {
    type: 'boolean',
  },
  storage: LibroUserSettingStorage,
};

const LineWarp: ConfigurationNode<'wordWrapColumn' | 'off' | 'on' | 'bounded'> = {
  id: 'libro.user.codeeditor.linewarp',
  description: l10n.t(`自动换行策略:
  - "off", lines will never wrap.
  - "on", lines will wrap at the viewport border.
  - "wordWrapColumn", lines will wrap at 'wordWrapColumn'.
  - "bounded", lines will wrap at minimum between viewport width and wordWrapColumn.`),
  title: l10n.t('自动换行'),
  type: 'select',
  defaultValue: defaultConfig.lineWrap,
  schema: {
    type: 'string',
    enum: ['off', 'on', 'wordWrapColumn', 'bounded'],
  },
  storage: LibroUserSettingStorage,
};

const WordWrapColumn: ConfigurationNode<number> = {
  id: 'libro.user.codeeditor.wordWrapColumn',
  description: l10n.t('开启自动换行后，自动换行的列数'),
  title: l10n.t('自动换行列数'),
  type: 'inputnumber',
  defaultValue: defaultConfig.wordWrapColumn,
  schema: {
    type: 'number',
  },
  storage: LibroUserSettingStorage,
};

const LSPEnabled: ConfigurationNode<boolean> = {
  id: 'libro.user.codeeditor.lspenabled',
  description: l10n.t(
    '开启语言服务后，编辑器能提供更多辅助编码能力，包括：自动提示、代码诊断、hover提示、格式化、代码跳转、重命名等等',
  ),
  title: l10n.t('开启语言服务'),
  type: 'checkbox',
  defaultValue: defaultConfig.lspEnabled,
  schema: {
    type: 'boolean',
  },
  storage: LibroUserSettingStorage,
};

export const CodeEditorSetting: {
  [key in keyof IEditorConfig]?: ConfigurationNode<any>;
} = {
  fontSize: FontSize,
  tabSize: TabSize,
  insertSpaces: InsertSpaces,
  lineHeight: LineHeight,
  lineWrap: LineWarp,
  wordWrapColumn: WordWrapColumn,
  lspEnabled: LSPEnabled,
};

@singleton({ contrib: [ConfigurationContribution, ApplicationContribution] })
export class CodeEditorSettings
  implements ConfigurationContribution, ApplicationContribution, Disposable
{
  protected readonly configurationService: ConfigurationService;

  protected codeEditorSettingsChangeEmitter = new Emitter<{
    key: keyof IEditorConfig;
    value: any;
  }>();

  onCodeEditorSettingsChange = this.codeEditorSettingsChangeEmitter.event;

  protected toDispose = new DisposableCollection();

  protected useSettings: Partial<IEditorConfig> | undefined;

  constructor(
    @inject(ConfigurationService)
    configurationService: ConfigurationService,
  ) {
    this.configurationService = configurationService;
  }
  registerConfigurations() {
    return [
      FontSize,
      TabSize,
      InsertSpaces,
      LineHeight,
      LineWarp,
      WordWrapColumn,
      LSPEnabled,
    ];
  }

  async onStart() {
    this.useSettings = await this.fetchUserEditorSettings();
    this.handleEditorSettingsChange();
  }
  getUserEditorSettings(): Partial<IEditorConfig> | undefined {
    return this.useSettings;
  }

  protected async fetchUserEditorSettings(): Promise<Partial<IEditorConfig>> {
    const result: Partial<IEditorConfig> = {};
    Object.typedKeys(CodeEditorSetting).forEach(async (key) => {
      result[key] = await this.configurationService.get(CodeEditorSetting[key]!);
    });
    return result;
  }

  protected handleEditorSettingsChange() {
    this.toDispose.push(
      this.configurationService.onConfigurationValueChange((e) => {
        // const ids = Object.values(CodeEditorSetting).map(item => item.id);
        const match = Object.entries(CodeEditorSetting).find(
          (item) => item[1].id === e.key,
        );
        if (match) {
          this.codeEditorSettingsChangeEmitter.fire({
            key: match[0] as any,
            value: e.value,
          });
        }
      }),
    );
  }

  protected isDisposed = false;
  get disposed() {
    return this.isDisposed;
  }
  dispose() {
    if (this.disposed) {
      return;
    }
    this.toDispose.dispose();
    this.isDisposed = true;
  }
}
