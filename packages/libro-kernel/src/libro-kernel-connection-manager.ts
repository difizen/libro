import { inject, singleton } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';

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

  async startNew(fileInfo: IContentsModel): Promise<IKernelConnection | undefined> {
    const connection = await this.sessionManager.startNew(fileInfo);
    if (!connection) {
      throw new Error('start new kernel connection failed');
    }
    this.kernelConnectionMap.set(fileInfo.name, connection);
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
    this.kernelConnectionMap.set(fileInfo.name, connection);
    return connection;
  }

  async shutdownKC(fileInfo: IContentsModel) {
    const fileName = fileInfo.name;
    const kc = this.kernelConnectionMap.get(fileName);

    if (!kc) {
      throw new Error('interrupt connection failed');
    }

    await this.sessionManager.shutdownKC(fileInfo, kc);
    this.kernelConnectionMap.delete(fileName);
  }

  getAllKernelConnections() {
    return this.kernelConnectionMap;
  }

  getKernelConnection(fileInfo: IContentsModel) {
    const connection = this.kernelConnectionMap.get(fileInfo.name);
    if (connection && !connection.isDisposed) {
      return connection;
    }
    return;
  }
}
