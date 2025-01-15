import { ServerConnection, ServerManager } from '@difizen/libro-jupyter';
import {
  ApplicationContribution,
  inject,
  singleton,
  ThemeService,
} from '@difizen/mana-app';

@singleton({ contrib: ApplicationContribution })
export class LibroApp implements ApplicationContribution {
  protected readonly themeService: ThemeService;
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(ServerManager) serverManager: ServerManager;

  constructor(
    @inject(ThemeService)
    themeService: ThemeService,
  ) {
    this.themeService = themeService;
  }

  onStart = () => {
    this.themeService.setCurrentTheme('dark');
    this.serverConnection.updateSettings({
      baseUrl: 'http://localhost:8888/',
      wsUrl: 'ws://localhost:8888/',
    });
    this.serverManager.launch();
  };
}
