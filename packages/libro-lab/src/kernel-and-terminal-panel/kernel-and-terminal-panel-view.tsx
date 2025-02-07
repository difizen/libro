import { LibroKernelManager, LibroSessionManager } from '@difizen/libro-kernel';
import { LibroLanguageClientManager } from '@difizen/libro-language-client';
import { TerminalCommands, TerminalManager } from '@difizen/libro-terminal';
import {
  BaseView,
  CommandRegistry,
  inject,
  singleton,
  ThemeService,
  useInject,
  view,
  ViewInstance,
  ViewManager,
} from '@difizen/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { ConfigProvider, theme } from 'antd';
import { useEffect, useState } from 'react';

import { KernelAndTerminal } from '../common/index.js';
import type { SaveableTabView } from '../index.js';
import { LibroLabLayoutSlots } from '../index.js';
import { LayoutService } from '../layout/layout-service.js';

import type {
  LibroPanelCollapseItem,
  LibroPanelCollapseKernelItem,
} from './collapse/index.js';
import { LibroPanelCollapseItemType, LibroCollapse } from './collapse/index.js';

import './index.less';

const PanelRender: React.FC = () => {
  const instance = useInject<KernelAndTerminalPanelView>(ViewInstance);
  const openedTabView = instance.getAllOpenedTabView();
  const themeService = useInject<ThemeService>(ThemeService);

  const {
    libroKernelManager,
    libroSessionManager,
    terminalManager,
    libroLanguageClientManager,
    commandRegistry,
  } = instance;

  const [kernelItems, setKernelItems] = useState<
    LibroPanelCollapseKernelItem[] | undefined
  >();

  const [terminalItems, setTerminalItems] = useState<
    LibroPanelCollapseItem[] | undefined
  >();

  const [lspItems, setLSPItems] = useState<LibroPanelCollapseItem[] | undefined>();

  libroLanguageClientManager.sessionsChanged(() => {
    const sessions = libroLanguageClientManager.sessions;

    const items = [] as LibroPanelCollapseItem[];

    sessions.forEach((session: any, key: string) => {
      items.push({
        id: key,
        name: `${key} (${session.spec.languages.join('/')})`,
        shutdown: async () => await libroLanguageClientManager.closeLanguageClient(key),
      });
    });

    setLSPItems(items);
  });

  useEffect(() => {
    if (
      !libroSessionManager.running ||
      (libroSessionManager.running && libroSessionManager.running.size === 0)
    ) {
      setKernelItems(undefined);
      return;
    }

    // kernelId -> item
    const items = new Map<string, LibroPanelCollapseKernelItem>();

    const runningSessions = libroSessionManager.running.values();

    for (const session of runningSessions) {
      const kernel = session.kernel!;
      if (items.has(kernel.id)) {
        items.get(kernel.id)?.notebooks.push({
          sessionId: session.id,
          name: session.name,
          path: session.path,
        });
      } else {
        items.set(kernel.id, {
          id: kernel.id,
          name: kernel.name,
          shutdown: async () => await libroKernelManager.shutdown(kernel.id),
          notebooks: [
            { sessionId: session.id, name: session.name, path: session.path },
          ],
        });
      }
    }

    setKernelItems(Array.from(items.values()));
  }, [libroKernelManager, libroSessionManager.running]);

  useEffect(() => {
    if (
      !terminalManager.runningModels ||
      (terminalManager.runningModels && terminalManager.runningModels.length === 0)
    ) {
      setTerminalItems(undefined);
      return;
    }

    const items = [];
    for (const terminal of terminalManager.runningModels) {
      items.push({
        id: 'terminal/' + terminal,
        name: terminal,
        shutdown: async () => {
          await terminalManager.shutdown(terminal);
          commandRegistry.executeCommand(
            TerminalCommands['CloseTerminal'].id,
            terminal,
          );
        },
      });
    }

    setTerminalItems(items);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalManager.runningModels]);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeService.getCurrentTheme().type === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <div className="kernel-and-terminal-panel">
        <LibroCollapse
          type={LibroPanelCollapseItemType.PAGE}
          items={openedTabView.children.map((item) => {
            return {
              id: item.id + '',
              name: item.title.label as string,
            };
          })}
          tabView={openedTabView}
          shutdownAll={async () => {
            // dispose会影响原始数组，这里使用解构赋值copy一份数组。
            for (const item of [...openedTabView.children]) {
              if (item.title.closable) {
                item.dispose();
              }
            }
          }}
        />

        <LibroCollapse
          type={LibroPanelCollapseItemType.KERNEL}
          items={kernelItems}
          shutdownAll={async () => {
            await libroKernelManager.shutdownAll();
            await libroSessionManager.refreshRunning();
          }}
        />

        <LibroCollapse
          type={LibroPanelCollapseItemType.TERMINAL}
          items={terminalItems}
          shutdownAll={async () => await terminalManager.shutdownAll()}
        />

        <LibroCollapse
          type={LibroPanelCollapseItemType.LSP}
          items={lspItems}
          shutdownAll={async () =>
            await libroLanguageClientManager.closeAllLanguageClient()
          }
        />
      </div>
    </ConfigProvider>
  );
};

export const KernelAndTerminalPanelViewId = 'libro-kernel-and-terminal-view';

@singleton()
@view(KernelAndTerminalPanelViewId)
export class KernelAndTerminalPanelView extends BaseView {
  override view = PanelRender;
  @inject(ViewManager) protected viewManager: ViewManager;
  @inject(LayoutService) protected layoutService: LayoutService;

  libroKernelManager: LibroKernelManager;
  libroSessionManager: LibroSessionManager;
  terminalManager: TerminalManager;
  libroLanguageClientManager: LibroLanguageClientManager;
  commandRegistry: CommandRegistry;

  constructor(
    @inject(LibroKernelManager) libroKernelManager: LibroKernelManager,
    @inject(LibroSessionManager) libroSessionManager: LibroSessionManager,
    @inject(TerminalManager) terminalManager: TerminalManager,
    @inject(LibroLanguageClientManager)
    libroLanguageClientManager: LibroLanguageClientManager,
    @inject(CommandRegistry) commandRegistry: CommandRegistry,
  ) {
    super();
    this.title.icon = <KernelAndTerminal />;
    this.title.label = () => <div>{l10n.t('运行的终端和内核')}</div>;

    this.libroKernelManager = libroKernelManager;
    this.libroSessionManager = libroSessionManager;
    this.terminalManager = terminalManager;
    this.libroLanguageClientManager = libroLanguageClientManager;
    this.commandRegistry = commandRegistry;
  }

  getAllOpenedTabView(): SaveableTabView {
    return this.layoutService.getAllSlotView(
      LibroLabLayoutSlots.content,
    ) as SaveableTabView;
  }

  refresh() {
    this.libroSessionManager.refreshRunning();
    this.terminalManager.refreshRunning();
    this.libroLanguageClientManager.refreshRunning();
  }
}
