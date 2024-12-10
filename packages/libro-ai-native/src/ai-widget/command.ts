import type { Command } from '@difizen/mana-app';

export const AIWidgetCommands: Record<string, Command & { keybind?: string }> = {
  Explain: {
    id: 'ai-widget:explain',
    label: 'EXPLAIN',
  },
  Optimize: {
    id: 'ai-widget:optimize',
    label: 'Optimize',
  },
};
