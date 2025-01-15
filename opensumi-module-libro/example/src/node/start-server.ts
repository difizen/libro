/* eslint-disable no-console */
import http from 'http';
import path from 'path';

import { Deferred } from '@opensumi/ide-core-common';
import type { IServerAppOpts, NodeModule } from '@opensumi/ide-core-node';
import { ServerApp } from '@opensumi/ide-core-node';
import Koa from 'koa';
import koaStatic from 'koa-static';

export async function startServer(
  arg1: NodeModule[] | Partial<IServerAppOpts>,
) {
  const app = new Koa();
  const deferred = new Deferred<http.Server>();
  const port = process.env.IDE_SERVER_PORT || 8000;
  const workspaceDir =
    process.env.WORKSPACE_DIR || path.join(__dirname, '../../workspace');
  const extensionDir =
    process.env.EXTENSION_DIR || path.join(__dirname, '../../../extensions');
  const extensionHost =
    process.env.EXTENSION_HOST_ENTRY ||
    path.join(__dirname, '..', '..', 'hosted/ext.process.js');
  let opts: IServerAppOpts = {
    use: app.use.bind(app),
    marketplace: {
      endpoint: 'https://open-vsx.org/api', // Official Registry
      // endpoint: 'https://marketplace.smartide.cn/api', // China Mirror
    },
    processCloseExitThreshold: 5 * 60 * 1000,
    terminalPtyCloseThreshold: 5 * 60 * 1000,
    staticAllowOrigin: '*',
    staticAllowPath: [workspaceDir, extensionDir, '/'],
    extHost: extensionHost,
  };
  if (Array.isArray(arg1)) {
    opts = {
      ...opts,
      modulesInstances: arg1,
    };
  } else {
    opts = {
      ...opts,
      ...arg1,
    };
  }

  const serverApp = new ServerApp(opts);
  const server = http.createServer(app.callback());

  if (process.env.NODE_ENV === 'production') {
    app.use(koaStatic(path.join(__dirname, '../../dist')));
  }

  await serverApp.start(server);

  server.on('error', (err) => {
    deferred.reject(err);
    console.error('Server error: ' + err.message);
    setTimeout(process.exit, 0, 1);
  });

  server.listen(port, () => {
    console.log(`Server listen on port ${port}`);
    deferred.resolve(server);
  });
  return deferred.promise;
}
