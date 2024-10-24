import type { Command } from '@difizen/mana-app';

export const AINativeCommands: Record<string, Command & { keybind?: string }> = {
  Explain: {
    id: 'ai-native:explain',
    label: 'EXPLAIN',
  },
  CellChat: {
    id: 'ai-native:cell-chat',
    label: 'Chat',
  },
  AISideToolbarSelect: {
    id: 'ai-native:side-toolbat-select',
  },
};
