import {
  initKernelPanelColorToken,
  initLibroColorToken,
  initLibroOpensumi,
  initTocPanelColorToken,
} from '@difizen/opensumi-module-libro';
import { Injector } from '@opensumi/di';
import type { IClientAppOpts } from '@opensumi/ide-core-browser';
import { ClientApp } from '@opensumi/ide-core-browser/lib/bootstrap/app';

import { manaContainer } from './mana-application';
import { StatusBarContribution } from './status-bar/status-bar.contribution';

initLibroColorToken();
initKernelPanelColorToken();
initTocPanelColorToken();
// Enable OpenSumi debug logger
process.env.KTLOG_SHOW_DEBUG = 'true';

export async function renderApp(opts: IClientAppOpts) {
  const isDev = process.env.DEVELOPMENT ?? true; //TODO
  const injector = new Injector();
  initLibroOpensumi(injector, manaContainer);
  injector.addProviders(StatusBarContribution);
  const hostname = window.location.hostname;
  const query = new URLSearchParams(window.location.search);
  // 线上的静态服务和 IDE 后端是一个 Server
  const serverPort = isDev ? 8000 : window.location.port;
  const staticServerPort = isDev ? 8080 : window.location.port;

  opts.workspaceDir = query.get('workspaceDir') || process.env.WORKSPACE_DIR;

  opts.extensionDir = opts.extensionDir || process.env.EXTENSION_DIR;
  opts.injector = injector;
  opts.wsPath = process.env.WS_PATH || `ws://${hostname}:${serverPort}`;
  opts.extWorkerHost =
    opts.extWorkerHost ||
    process.env.EXTENSION_WORKER_HOST ||
    `http://${hostname}:${staticServerPort}/worker-host.js`;
  opts.staticServicePath = `http://${hostname}:${serverPort}`;
  const anotherHostName = process.env.WEBVIEW_HOST || hostname;
  opts.webviewEndpoint = `http://${anotherHostName}:9090`;

  opts.devtools = true;
  opts.enableDebugExtensionHost = true;
  const app = new ClientApp(opts);

  app.fireOnReload = () => {
    window.location.reload();
  };

  app.start(document.getElementById('main')!, 'web');
}
