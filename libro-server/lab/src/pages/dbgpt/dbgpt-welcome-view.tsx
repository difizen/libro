import { ServerConnection } from '@difizen/libro-jupyter';
import { EntryPointView, LayoutService, WelcomeView } from '@difizen/libro-lab';
import {
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewRender,
} from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { forwardRef } from 'react';


import './index.less';

export const WelcomeComponent = forwardRef(function WelcomeComponent() {
  const instance = useInject<WelcomeView>(ViewInstance);
  const layoutService = useInject(LayoutService);
  const serverConnection = useInject(ServerConnection);
  return (
    <div className="libro-lab-welcome-page">
      <div className="libro-lab-welcome-page-title" onClick={()=>{
        window.open('https://libro.difizen.net/','_blank')
      }}>
        {l10n.t('欢迎使用 Libro Lab🎉🎉')}
      </div>
      <div className="libro-lab-welcome-page-server-info">
        <div className="libro-lab-welcome-page-server-info-title">
          {l10n.t('服务连接信息')}
        </div>
        <div className="libro-lab-welcome-page-server-info-item">
          BaseURL: {`${serverConnection.settings.baseUrl}`}
        </div>
        <div className="libro-lab-welcome-page-server-info-item">
          WsURL: {`${serverConnection.settings.wsUrl}`}
        </div>
      </div>
      {layoutService.serverSatus === 'success' && (
        <ViewRender view={instance.entryPointView}></ViewRender>
      )}
    </div>
  );
});

@singleton()
@view('welcome-view')
export class DbgptWelcomeView extends BaseView {
  override view = WelcomeComponent;
  viewManager: ViewManager;
  entryPointView: EntryPointView;
  constructor(@inject(ViewManager) viewManager: ViewManager) {
    super();
    this.title.icon = '🙌 ';
    this.title.label = () => <div>{l10n.t('欢迎使用')}</div>;
    this.title.closable = false;
    this.viewManager = viewManager;
    this.viewManager
      .getOrCreateView(EntryPointView)
      .then((entryPointView) => {
        this.entryPointView = entryPointView;
        return;
      })
      .catch(console.error);
  }
}
