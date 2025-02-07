import type { Command } from '@difizen/libro-common/app';

export const AINativeCommands: Record<string, Command & { keybind?: string }> = {
  Explain: {
    id: 'ai-native:explain',
    label: 'EXPLAIN',
  },
  Chat: {
    id: 'ai-native:chat',
    label: 'Chat',
  },
  CellChat: {
    id: 'ai-native:cell-chat',
    label: 'Cell Chat',
  },
  AISideToolbarSelect: {
    id: 'ai-native:side-toolbat-select',
  },
  Optimize: {
    id: 'ai-native:optimize',
    label: 'Optimize',
  },
};
