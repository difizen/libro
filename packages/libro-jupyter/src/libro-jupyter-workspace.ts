import { URL } from '@difizen/libro-common';
import { BaseWorkspaceService, ILibroWorkspaceService } from '@difizen/libro-core';
import { ServerConnection, ServerManager } from '@difizen/libro-kernel';
import { ApplicationContribution } from '@difizen/libro-common/app';
import { URI } from '@difizen/libro-common/app';
import { inject, singleton } from '@difizen/libro-common/app';

interface JupyterWorkspaceData {
  rootUri: string;
}

@singleton({ contrib: [ILibroWorkspaceService, ApplicationContribution] })
export class JupyterWorkspaceService
  extends BaseWorkspaceService
  implements ILibroWorkspaceService, ApplicationContribution
{
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(ServerManager) serverManager: ServerManager;

  protected workspaceData: JupyterWorkspaceData;

  onViewStart() {
    this.serverManager.ready
      .then(() => {
        const settings = { ...this.serverConnection.settings };
        const url = URL.join(settings.baseUrl, '/libro/api/workspace');
        return this.serverConnection.makeRequest(url, {});
      })
      .then(async (res) => {
        const data = await res.json();
        this.workspaceData = data;
        this.deferred.resolve();
        return;
      })
      .catch(() => {
        return;
      });
  }

  override get workspaceRoot() {
    return new URI(this.workspaceData.rootUri);
  }
  override get notebooks() {
    return [];
  }
  override get files() {
    return [];
  }
}
