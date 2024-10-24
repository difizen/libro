import type { LibroSideToolbarMenuItemType } from '@difizen/libro-jupyter';
import { LibroSideToolbarMenu } from '@difizen/libro-jupyter';
import { l10n } from '@difizen/mana-l10n';
import { Popover } from 'antd';

import { AINativeCommands } from './ai-native-command.js';
import { AIIcon } from './icon.js';

export const AIToolbarSelector: React.FC = () => {
  const items: LibroSideToolbarMenuItemType[] = [
    {
      id: AINativeCommands['CellChat'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('AI 对话')}</span>
        </>
      ),
      group: 'ai',
    },
    {
      id: AINativeCommands['Explain'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('代码解释')}</span>
        </>
      ),
      group: 'ai',
    },
  ];

  return (
    <Popover
      placement="leftTop"
      content={<LibroSideToolbarMenu items={items} />}
      trigger="hover"
      overlayClassName="libro-popover-side-toolbar-menu libro-side-toolbar-ai-select-menu"
    >
      <div>
        <AIIcon />
      </div>
    </Popover>
  );
};
