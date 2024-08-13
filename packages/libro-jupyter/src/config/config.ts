import type { ConfigurationNode } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

export const LibroConfigAutoSave: ConfigurationNode<boolean> = {
  id: 'libro.autosave',
  description: l10n.t('是否自动保存修改'),
  title: '自动保存',
  type: 'checkbox',
  defaultValue: false,
  schema: {
    type: 'boolean',
  },
};

export const LibroConfigOpenSlot: ConfigurationNode<string> = {
  id: 'libro.jupyter.open.slot',
  description: '文件默认打开位置',
  title: '文件默认打开位置',
  type: 'input',
  defaultValue: 'main',
  schema: {
    type: 'string',
  },
};

export const LibroConfigAllowDownload: ConfigurationNode<boolean> = {
  id: 'libro.jupyter.allow.download',
  description: '是否允许下载',
  title: '允许下载',
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const LibroConfigAllowUpload: ConfigurationNode<boolean> = {
  id: 'libro.jupyter.allow.upload',
  description: '是否允许上传',
  title: '允许上传',
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const LibroConfigAllowPreferredSession: ConfigurationNode<boolean> = {
  id: 'libro.jupyter.allow.prefer.session',
  description: 'kernel切换是否显示Use Kernel from Preferred Session',
  title: '允许 Preferred session切换显示',
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const LibroConfigKernelUnreadyText: ConfigurationNode<string> = {
  id: 'libro.jupyter.kernel.unready.text',
  description: 'kernel unready text',
  title: 'kernel 处于 unready 时左上角提示文案',
  type: 'string',
  defaultValue: 'Kernel 准备中...',
  schema: {
    type: 'string',
  },
};

export const LibroConfigKernelUnreadyBtnText: ConfigurationNode<string> = {
  id: 'libro.jupyter.kernel.unready.btn.text',
  description: 'kernel unready btn text',
  title: 'kernel 处于 unready 时执行按钮提示文案',
  type: 'string',
  defaultValue: 'kernel准备中，无法执行',
  schema: {
    type: 'string',
  },
};

export const LibroJupyterConfiguration = {
  AutoSave: LibroConfigAutoSave,
  OpenSlot: LibroConfigOpenSlot,
  AllowUpload: LibroConfigAllowUpload,
  AllowPreferredSession: LibroConfigAllowPreferredSession,
  AllowDownload: LibroConfigAllowDownload,
  KernelUnreadyText: LibroConfigKernelUnreadyText,
  KernelUnreadyBtnText: LibroConfigKernelUnreadyBtnText,
};
