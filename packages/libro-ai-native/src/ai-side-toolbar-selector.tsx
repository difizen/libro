import type { LibroSideToolbarMenuItemType } from '@difizen/libro-jupyter';
import { LibroSideToolbarMenu } from '@difizen/libro-jupyter';
import { useInject } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';
import { Popover } from 'antd';

import { AINativeCommands } from './ai-native-command.js';
import { LibroAINativeService } from './ai-native-service.js';
import { AIIcon } from './icon.js';

export const AIToolbarSelector: React.FC = () => {
  const items: LibroSideToolbarMenuItemType[] = [
    {
      id: AINativeCommands['Explain'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('代码解释')}</span>
        </>
      ),
      group: 'ai',
    },
    {
      id: AINativeCommands['Optimize'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('代码优化')}</span>
        </>
      ),
      group: 'ai',
    },
  ];
  const libroAINativeService = useInject<LibroAINativeService>(LibroAINativeService);
  const handleOpenChange = (newOpen: boolean) => {
    libroAINativeService.showSideToolbar = newOpen;
  };

  return (
    <Popover
      placement="leftTop"
      content={<LibroSideToolbarMenu items={items} />}
      trigger="hover"
      open={libroAINativeService.showSideToolbar}
      onOpenChange={handleOpenChange}
      overlayClassName="libro-popover-side-toolbar-menu libro-side-toolbar-ai-select-menu"
    >
      <div>
        <AIIcon />
      </div>
    </Popover>
  );
};
