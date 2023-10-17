import { Poll } from '@difizen/libro-common';
import type { Event } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { prop, getOrigin } from '@difizen/mana-app';
import { Emitter } from '@difizen/mana-app';
import { StorageService } from '@difizen/mana-app';

import type { IContentsModel } from '../contents/index.js';
import { LibroKernelManager } from '../kernel/libro-kernel-manager.js';
import { LibroKernelFactory } from '../kernel/libro-kernel-protocol.js';
import type {
  KernelConnectionOptions,
  IKernelModel,
  IKernelConnection,
} from '../kernel/libro-kernel-protocol.js';
import type { ISettings } from '../server/index.js';
import { NetworkError } from '../server/index.js';
import { ServerManager } from '../server/server-manager.js';

import { LibroSessionFactory } from './libro-session-protocol.js';
import type {
  SessionMeta,
  ISessionOptions,
  SessionIModel,
} from './libro-session-protocol.js';
import type { DeepPartial } from './restapi.js';
import { SessionRestAPI } from './restapi.js';

interface PersistSessionMessage {
  sessionId: string;
  options: {
    model: {
      id: string; // kernel.id,
      name: string; //  kernel.name,
    };
  };
}

@singleton()
export class LibroSessionManager {
  protected sessionFactory: LibroSessionFactory;
  protected kernelFactory: LibroKernelFactory;
  @inject(SessionRestAPI) sessionRestAPI: SessionRestAPI;

  @prop()
  sessionIdMap = new Map<string, string>();

  readonly serverSettings: ISettings;
  protected kernelManager: LibroKernelManager;
  protected serverManager: ServerManager;
  protected _pollModels: Poll;
  protected _ready: Promise<void>;
  protected _isReady = false;
  protected storageService: StorageService;
  protected _models: Map<string, SessionIModel>;
  protected _sessionConnections: Map<string, IKernelConnection>; // sessionId -> kernelConnection

  constructor(
    @inject(LibroKernelManager) kernelManager: LibroKernelManager,
    @inject(ServerManager) serverManager: ServerManager,
    @inject(LibroSessionFactory) sessionFactory: LibroSessionFactory,
    @inject(LibroKernelFactory) kernelFactory: LibroKernelFactory,
    @inject(StorageService) storageService: StorageService,
  ) {
    this.kernelManager = kernelManager;
    this.serverManager = serverManager;
    this.sessionFactory = sessionFactory;
    this.kernelFactory = kernelFactory;
    this.storageService = storageService;
    this._models = new Map();
    this._sessionConnections = new Map();

    // Start model polling with exponential backoff.
    this._pollModels = new Poll({
      auto: false,
      factory: () => this.requestRunning(),
      frequency: {
        interval: 10 * 1000,
        backoff: true,
        max: 300 * 1000,
      },
      name: `@jupyterlab/services:SessionManager#models`,
      // standby: options.standby ?? 'when-hidden',
      standby: 'when-hidden',
    });

    // Initialize internal data.
    this._ready = (async () => {
      await getOrigin(this._pollModels).start();
      await getOrigin(this._pollModels).tick;
      // if (this._kernelManager.isActive) {
      //   await this._kernelManager.ready;
      // }
      this._isReady = true;
    })();
  }

  /**
   * Execute a request to the server to poll running kernels and update state.
   */
  protected async requestRunning(): Promise<void> {
    let models: SessionMeta[];
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      models = await this.sessionRestAPI.listRunning(this.serverSettings);
    } catch (err: any) {
      // Handle network errors, as well as cases where we are on a
      // JupyterHub and the server is not running. JupyterHub returns a
      // 503 (<2.0) or 424 (>2.0) in that case.
      if (
        err instanceof NetworkError ||
        err.response?.status === 503 ||
        err.response?.status === 424
      ) {
        this._connectionFailure.fire(err);
      }
      throw err;
    }

    this._models = new Map(models.map((x) => [x.id, x]));

    for (const [sessionId, kc] of this._sessionConnections) {
      if (!this._models.has(sessionId)) {
        let filePersistKey = '';
        this.sessionIdMap.forEach((id, pk) => {
          if (id === sessionId) {
            filePersistKey = pk;
            return;
          }
        });

        await this.storageService.setData(filePersistKey, undefined);
        kc.dispose();
        this.sessionIdMap.delete(filePersistKey);
      }
    }
  }

  protected _connectionFailure = new Emitter<Error>();

  /**
   * A signal emitted when there is a connection failure.
   */
  get connectionFailure(): Event<Error> {
    return this._connectionFailure.event;
  }

  @prop()
  kernelConnection?: IKernelConnection;

  protected persistKey(fileInfo: IContentsModel): string {
    return `${fileInfo.path}/${fileInfo.name}`;
  }

  async shutdownKC(fileInfo: IContentsModel, kc: IKernelConnection) {
    // 删除缓存
    await this.storageService.setData(this.persistKey(fileInfo), undefined);
    await kc.shutdown();
    this.sessionIdMap.delete(this.persistKey(fileInfo));
  }

  async connectToKernel(
    fileInfo: IContentsModel,
    reuseKernelInfo?: { id: string; name: string },
  ): Promise<IKernelConnection | undefined> {
    // 轮询获取的kernelspec，选取第一个kernelspec作为默认kernel
    let firstKernelSpecName = undefined;
    if (
      this.serverManager.kernelspec &&
      this.serverManager.kernelspec.kernelspecs &&
      Object.keys(this.serverManager.kernelspec?.kernelspecs).length !== 0
    ) {
      const kernelspec = Object.keys(this.serverManager.kernelspec.kernelspecs)[0];
      firstKernelSpecName =
        this.serverManager.kernelspec?.kernelspecs[kernelspec]?.name;
    }

    const newSession = await this.sessionRestAPI.startSession(
      {
        name: fileInfo.name,
        kernel: {
          kernelName: reuseKernelInfo
            ? reuseKernelInfo.name
            : fileInfo.content.metadata.kernelspec?.name || firstKernelSpecName, // 使用ipynb文件原本的kernel name，或者使用kernel spec轮询得到的第一个kernel name
        },
        path: fileInfo.path,
        type: fileInfo.type,
      } as ISessionOptions,
      this.serverSettings,
    );
    await this.refreshRunning();

    if (!newSession || !newSession.kernel) {
      return undefined;
    }

    // // 根据session中的信息，新建kernel
    // newSession.kernel = this.kernelFactory(newSession.kernel);
    // newSession.kernel.sessionIds.add(newSession.id);

    // 建立Kernel连接
    const options = {
      model: {
        id: reuseKernelInfo ? reuseKernelInfo.id : newSession.kernel.id,
        name: reuseKernelInfo ? reuseKernelInfo.name : newSession.kernel.name,
      },
    } as KernelConnectionOptions;

    await this.storageService.setData(
      this.persistKey(fileInfo),
      JSON.stringify({
        sessionId: newSession.id,
        options: options,
      } as PersistSessionMessage),
    );

    this.sessionIdMap.set(this.persistKey(fileInfo), newSession.id);

    const kernelConnection = await this.kernelManager.connectToKernel({
      ...options,
      serverSettings: this.serverSettings,
    });

    this._sessionConnections.set(newSession.id, kernelConnection);

    return kernelConnection;
    // newSession.kernel.kernelConnection = kernelConnection;

    // // 新建session
    // const currLibroSession = this.sessionFactory(newSession as SessionMeta);
    // // 保存session
    // this.sessionMap.set(newSession.id, currLibroSession);
    // // 保存kernel
    // this.kernelManager.kernelMap.set(newSession.kernel.id, newSession.kernel);
  }

  async startNew(fileInfo: IContentsModel) {
    // const fileContent = await sessionApi.queryFile(params.fileName, params.type);

    // const { name, content, type, path } = fileInfo;

    // await this.queryAndUpdateSessions();

    const tryGetPersistSession: string | undefined = await this.storageService.getData(
      this.persistKey(fileInfo),
    );

    let kernelConnection = undefined;

    if (!tryGetPersistSession) {
      kernelConnection = await this.connectToKernel(fileInfo);
    } else {
      const { options, sessionId } = JSON.parse(
        tryGetPersistSession,
      ) as PersistSessionMessage;

      const kernelId = options.model.id;
      const isAlive = await this.kernelManager.isKernelAlive(kernelId);

      if (isAlive) {
        // 尝试复用缓存中的kernel
        kernelConnection = await this.kernelManager.connectToKernel({
          ...options,
          serverSettings: this.serverSettings,
        });
        if (kernelConnection) {
          this._sessionConnections.set(sessionId, kernelConnection);
        }
      } else {
        // TODO: 如果缓存中的kernel不能重用，则使用fileInfo建立新的kernel连接
        await this.storageService.setData(this.persistKey(fileInfo), undefined);
        kernelConnection = await this.connectToKernel(fileInfo);
      }
    }

    this.kernelConnection = kernelConnection;
    return kernelConnection;
  }

  /**
   * Force a refresh of the running sessions.
   *
   * @returns A promise that with the list of running sessions.
   *
   * #### Notes
   * This is not typically meant to be called by the user, since the
   * manager maintains its own internal state.
   */
  async refreshRunning(): Promise<void> {
    await getOrigin(this._pollModels).refresh();
    await getOrigin(this._pollModels).tick;
  }

  /**
   * Send a PATCH to the server, updating the session path or the kernel.
   */
  private async _patch(
    body: DeepPartial<SessionIModel>,
    sessionId?: string,
  ): Promise<SessionIModel> {
    // TODO: 复用session
    const model = await this.sessionRestAPI.updateSession(
      { ...body, id: sessionId ?? '' },
      this.serverSettings,
    );
    // this.update(model);
    return model;
  }

  /**
   * Change the kernel.
   *
   * @param options - The name or id of the new kernel.
   *
   * #### Notes
   * This shuts down the existing kernel and creates a new kernel,
   * keeping the existing session ID and session path.
   */
  async changeKernel(
    fileInfo: IContentsModel,
    options: Partial<IKernelModel>,
  ): Promise<IKernelConnection | null> {
    let reuseSessionId = this.sessionIdMap.get(this.persistKey(fileInfo));

    // shutdown 过后
    if (!reuseSessionId) {
      const newSession = await this.sessionRestAPI.startSession(
        {
          name: fileInfo.name,
          kernel: {
            kernelName: options.name || fileInfo.content.metadata.kernelspec.name,
          },
          path: fileInfo.path,
          type: fileInfo.type,
        } as ISessionOptions,
        this.serverSettings,
      );
      await this.refreshRunning();

      if (!newSession || !newSession.kernel) {
        return null;
      }
      reuseSessionId = newSession.id;
      this.sessionIdMap.set(this.persistKey(fileInfo), reuseSessionId!);
    }

    const model = await this._patch({ kernel: options } as any, reuseSessionId);

    if (!model || !model.kernel) {
      return null;
    }

    const optionsForConnectKernel = {
      model: {
        id: model.kernel.id,
        name: model.kernel.name,
      },
    } as KernelConnectionOptions;

    await this.storageService.setData(
      this.persistKey(fileInfo),
      JSON.stringify({
        sessionId: reuseSessionId,
        options: optionsForConnectKernel,
      } as PersistSessionMessage),
    );

    const kernelConnection = await this.kernelManager.connectToKernel({
      ...optionsForConnectKernel,
      serverSettings: this.serverSettings,
    });

    this._sessionConnections.set(reuseSessionId!, kernelConnection);

    return kernelConnection;
  }
}
