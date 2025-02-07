import { inject, singleton } from '@difizen/libro-common/mana-app';
import { prop } from '@difizen/libro-common/mana-app';

import type { IContentsModel } from './contents/index.js';
import { LibroKernelManager } from './kernel/libro-kernel-manager.js';
import type { IKernelConnection } from './kernel/libro-kernel-protocol.js';
import { LibroSessionManager } from './session/libro-session-manager.js';

@singleton()
export class LibroKernelConnectionManager {
  protected sessionManager: LibroSessionManager;
  protected kernelManager: LibroKernelManager;

  @prop()
  protected kernelConnectionMap: Map<string, IKernelConnection>;

  constructor(
    @inject(LibroSessionManager) sessionManager: LibroSessionManager,
    @inject(LibroKernelManager) kernelManager: LibroKernelManager,
  ) {
    this.sessionManager = sessionManager;
    this.kernelManager = kernelManager;
    this.kernelConnectionMap = new Map<string, IKernelConnection>();
  }

  private mpKey(fileInfo: IContentsModel) {
    return fileInfo.path || fileInfo.name; // 优先用path作为key
  }

  async startNew(fileInfo: IContentsModel): Promise<IKernelConnection | undefined> {
    const connection = await this.sessionManager.startNew(fileInfo);
    if (!connection) {
      throw new Error('start new kernel connection failed');
    }
    this.kernelConnectionMap.set(this.mpKey(fileInfo), connection);
    return connection;
  }

  async changeKernel(
    fileInfo: IContentsModel,
    reuseKernelInfo: { id?: string; name: string },
  ) {
    const connection = await this.sessionManager.changeKernel(
      fileInfo,
      reuseKernelInfo,
    );
    if (!connection) {
      throw new Error('change kernel connection failed');
    }
    this.kernelConnectionMap.set(this.mpKey(fileInfo), connection);
    return connection;
  }

  async shutdownKC(fileInfo: IContentsModel) {
    const kc = this.kernelConnectionMap.get(this.mpKey(fileInfo));

    if (!kc) {
      throw new Error('interrupt connection failed');
    }

    await this.sessionManager.shutdownKC(fileInfo, kc);
    this.kernelConnectionMap.delete(this.mpKey(fileInfo));
  }

  getAllKernelConnections() {
    return this.kernelConnectionMap;
  }

  getKernelConnection(fileInfo: IContentsModel) {
    const connection = this.kernelConnectionMap.get(this.mpKey(fileInfo));
    if (connection && !connection.isDisposed) {
      return connection;
    }
    return;
  }
}
