import type { ConfigurationNode } from '@difizen/mana-app';

export const LibroJupyterConfiguration: Record<string, ConfigurationNode<string>> = {
  OpenSlot: {
    id: 'libro.jupyter.open.slot',
    description: '文件默认打开位置',
    title: '文件默认打开位置',
    type: 'checkbox',
    defaultValue: 'main',
    schema: {
      type: 'string',
    },
  },
};
