import {
  FileCommandContribution,
  JupyterFileService,
  LibroJupyterConfiguration,
  PageConfig,
  ServerConnection,
  ServerManager,
} from '@difizen/libro-jupyter';
import { ConfigurationService, FileTreeView, FileTreeViewFactory, OpenerService, ThemeService, URI } from '@difizen/mana-app';
import { SlotViewManager } from '@difizen/mana-app';
import { terminalDefaultSlot } from '@difizen/libro-terminal';
import qs from 'query-string';
import { ApplicationContribution, ViewManager } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { Fetcher } from '@difizen/magent-core';
import { l10n, L10nLang } from '@difizen/mana-l10n';
import { LayoutService, LibroLabLayoutSlots } from '@difizen/libro-lab';
const ShouldPreventStoreViewKey = 'mana-should-prevent-store-view';

function getLocaleFromLang(lang: string): string {
  const languageMap: { [key: string]: string } = {
    zh: 'zh-CN',
    en: 'en-US',
  };
  const storedLang = localStorage.getItem('__db_gpt_lng_key');
  const deafultLang = storedLang=== 'zh' ? 'zh-CN' : 'en-US'
  const matchedLang = lang.match(/^lang:(\w+)$/)?.[1];

  if (matchedLang) {
    return languageMap[matchedLang] || deafultLang;
  }

  return deafultLang;
}

@singleton({ contrib: ApplicationContribution })
export class LibroApp implements ApplicationContribution {
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(ServerManager) serverManager: ServerManager;
  @inject(ViewManager) viewManager: ViewManager;
  @inject(SlotViewManager) slotViewManager: SlotViewManager;
  @inject(ConfigurationService) configurationService: ConfigurationService;
  @inject(LayoutService) layoutService: LayoutService;
  @inject(FileCommandContribution) fileCommandContribution: FileCommandContribution;
  @inject(Fetcher) fetcher: Fetcher;
  @inject(OpenerService) openerService: OpenerService;
  @inject(JupyterFileService) jupyterFileService: JupyterFileService;
  @inject(ThemeService) themeService: ThemeService;
  location: string

  async onStart() {
    this.configurationService.set(LibroJupyterConfiguration.AllowDownload, true);
    this.configurationService.set(LibroJupyterConfiguration.AllowUpload, true);
    this.fileCommandContribution.allowUpload = true;
    this.fileCommandContribution.allowDownload = true;
    let baseUrl = PageConfig.getOption('baseUrl');
    const el = document.getElementById('jupyter-config-data');
    if (el) {
      const pageConfig = JSON.parse(el.textContent || '') as Record<string, string>;
      baseUrl = pageConfig['baseUrl'];
      if (baseUrl && baseUrl.startsWith('/')) {
        baseUrl = window.location.origin + baseUrl;
      }
    }
    localStorage.setItem(ShouldPreventStoreViewKey, 'true');
    this.configurationService.set(
      LibroJupyterConfiguration['OpenSlot'],
      LibroLabLayoutSlots.content,
    );
    this.configurationService.set(
      terminalDefaultSlot,
      LibroLabLayoutSlots.contentBottom,
    );
    window.addEventListener('message', (event) => {
      // 确保消息来自可信源
      if (event.origin === `${window.location.protocol}//${window.location.hostname}:5670`) {
        console.log('Received message from parent:', event.data);
        if(event.data.startsWith("lang:")){
          l10n.changeLang(getLocaleFromLang(event.data) as L10nLang);
          this.layoutService.refresh()
        }
        if(event.data.startsWith("theme:")){
          const matchedTheme = event.data.match(/^theme:(\w+)$/)?.[1];
          const defaultTheme = localStorage.getItem('__db_gpt_theme_key');
          this.themeService.setCurrentTheme(matchedTheme||defaultTheme)
        }
      }
    });
    this.serverConnection.updateSettings({
      baseUrl,
      wsUrl: baseUrl.replace(/^http(s)?/, 'ws$1'),
    });
    this.serverManager.launch();
    this.serverManager.ready
      .then(async () => {
        this.layoutService.setAreaVisible(LibroLabLayoutSlots.navigator, true);
        this.layoutService.setAreaVisible(LibroLabLayoutSlots.alert, false);
        this.layoutService.serverSatus = 'success';
        await this.initialWorkspace();
        if(this.location){
          const locationUri = new URI(this.location)
          const defaultOpenUri = new URI(this.location+'/flow_run.ipynb');
          if (!(await this.jupyterFileService.resolve(defaultOpenUri)).isFile) {
            await this.jupyterFileService.newFile('flow_run.ipynb',locationUri)
          }
          this.openerService.getOpener(defaultOpenUri).then((opener) => {
            if (opener) {
              opener.open(defaultOpenUri, {
                viewOptions: {
                  name: 'flow_run.ipynb',
                },
              });
            }
          });
        }
        return;
      })
      .catch(console.error);
  }

  protected async initialWorkspace() {    
    const queryParams = qs.parse(window.location.search);
    const flow_uid = queryParams['flow_uid'];
    const res = await this.fetcher.get<any>(`/api/v1/serve/awel/flow/notebook/file/path`, {
      flow_uid:flow_uid,
    },{baseURL:`${window.location.protocol}//${window.location.hostname}:5670`});
    if(res.status&& res.data?.data?.path){
      const view =
      await this.viewManager.getOrCreateView<FileTreeView>(FileTreeViewFactory);
      if (view) {
        const location = res.data?.data?.path;
        this.location = location;
        view.model.rootVisible = false;
        view.model.location = new URI(location);
      }
    }
  }
}
