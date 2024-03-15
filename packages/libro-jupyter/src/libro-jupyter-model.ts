import type { VirtualizedManager } from '@difizen/libro-core';
import { LibroModel, VirtualizedManagerHelper } from '@difizen/libro-core';
import {
  ContentsManager,
  isDisplayDataMsg,
  LibroKernelConnectionManager,
  ServerConnection,
  ServerManager,
} from '@difizen/libro-kernel';
import type { IKernelConnection, ExecutableNotebookModel } from '@difizen/libro-kernel';
import type { IContentsCheckpointModel, IContentsModel } from '@difizen/libro-kernel';
import { getOrigin, ModalService, prop } from '@difizen/mana-app';
import { Deferred } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import {
  ExecutedWithKernelCellModel,
  libroArgsMimetype,
  LibroFileService,
} from './libro-jupyter-protocol.js';
import { SaveFileErrorModal } from './toolbar/save-file-error.js';
import { getDefaultKernel } from './utils/index.js';

type IModel = IContentsModel;
@transient()
export class LibroJupyterModel extends LibroModel implements ExecutableNotebookModel {
  protected libroFileService: LibroFileService;
  protected virtualizedManager: VirtualizedManager;

  get fileService() {
    return this.libroFileService;
  }

  @prop()
  currentFileContents: IModel;
  @prop()
  protected kernelSelect: string;
  @prop()
  protected kernelStatus: string;
  @prop()
  kernelConnection?: IKernelConnection;

  @prop()
  lspEnabled = true;

  protected kernelConnectionManager: LibroKernelConnectionManager;
  protected serverManager: ServerManager;
  protected serverConnection: ServerConnection;
  protected readonly contentsManager: ContentsManager;
  protected readonly modalService: ModalService;

  constructor(
    @inject(LibroFileService) libroFileService: LibroFileService,
    @inject(LibroKernelConnectionManager)
    kernelConnectionManager: LibroKernelConnectionManager,
    @inject(ServerManager) serverManager: ServerManager,
    @inject(ServerConnection) serverConnection: ServerConnection,
    @inject(ContentsManager) contentsManager: ContentsManager,
    @inject(ModalService) modalService: ModalService,
    @inject(VirtualizedManagerHelper)
    virtualizedManagerHelper: VirtualizedManagerHelper,
  ) {
    super();
    this.kernelSelection = getDefaultKernel();
    this.libroFileService = libroFileService;
    this.kernelConnectionManager = kernelConnectionManager;
    this.serverManager = serverManager;
    this.serverConnection = serverConnection;
    this.contentsManager = contentsManager;
    this.modalService = modalService;
    this.dndAreaNullEnable = true;
    this.virtualizedManager = virtualizedManagerHelper.getOrCreate(this);
    this.kcReady
      .then(() => {
        this.kernelConnection?.futureMessage((msg) => {
          if (isDisplayDataMsg(msg) && libroArgsMimetype in msg.content.data) {
            this.metadata = {
              ...this.metadata,
              args: msg.content.data[libroArgsMimetype],
            };
          }
        });
        return;
      })
      .catch(() => {
        return;
      });
  }

  get isKernelIdle() {
    return this.kernelConnection && this.kernelConnection.status === 'idle';
  }

  get kernelSelection() {
    return this.kernelSelect;
  }

  set kernelSelection(value: string) {
    this.kernelSelect = value;
  }

  get currentKernelStatus() {
    return this.kernelStatus;
  }

  set currentKernelStatus(value: string) {
    this.kernelStatus = value;
  }
  protected kcDeferred = new Deferred<IKernelConnection>();
  get kcReady() {
    return this.kcDeferred.promise;
  }

  @prop()
  kernelConnecting: boolean | undefined;

  @prop()
  filePath = '';

  protected last_modified = '';

  get lastModified() {
    return this.last_modified;
  }

  set lastModified(value: string) {
    this.last_modified = value;
  }

  latestCheckPointModel: IContentsCheckpointModel;

  async createCheckpoint() {
    this.latestCheckPointModel = await this.contentsManager.createCheckpoint(
      this.filePath,
    );
  }

  async listCheckpoints() {
    await this.contentsManager.listCheckpoints(this.filePath);
  }

  async restoreCheckpoint(checkpointID: string) {
    await this.contentsManager.restoreCheckpoint(this.filePath, checkpointID);
  }

  async deleteCheckpoint(checkpointID: string) {
    await this.contentsManager.deleteCheckpoint(this.filePath, checkpointID);
  }

  startKernelConnection() {
    this.kernelConnecting = true;
    const fileInfo = this.currentFileContents;
    this.serverManager.ready
      .then(async () => {
        const kernelConnection =
          this.kernelConnectionManager.getKernelConnection(fileInfo);
        if (kernelConnection) {
          this.kernelConnection = kernelConnection;
          this.kcDeferred.resolve(this.kernelConnection);
          this.kernelConnecting = false;
        } else {
          const kc = await this.kernelConnectionManager.startNew(
            this.currentFileContents,
          );
          if (!kc) {
            return;
          }
          this.kernelConnection = kc;
          this.kcDeferred.resolve(kc);
          this.kernelConnecting = false;
        }
        return;
      })
      .catch(console.error);
  }

  override async saveNotebookContent(): Promise<void> {
    const notebookContent = this.toJSON();
    if (!this.currentFileContents) {
      throw new Error('currentFileContents is undefined');
    }

    let res = {} as IModel | undefined;

    try {
      res = await this.libroFileService.write(
        notebookContent,
        this.currentFileContents,
      );
      if (!res) {
        return;
      }
      // 文件保存失败
      if (res.last_modified === this.last_modified || res.size === 0) {
        const errorMsg = `File Save Error: ${res?.message} `;
        this.libroFileService.fileSaveErrorEmitter.fire({
          cause: res.message,
          msg: errorMsg,
          name: res.name,
          path: res.path,
          created: res.created,
          last_modified: res.last_modified,
          size: res.size,
          type: res.type,
        });
        this.modalService.openModal(SaveFileErrorModal);

        throw new Error(errorMsg);
      }
    } catch (e: any) {
      if (!res) {
        return;
      }
      this.libroFileService.fileSaveErrorEmitter.fire({
        cause: e.errorCause,
        msg: e.message,
        name: res.name || this.currentFileContents.name,
        path: res.path || this.currentFileContents.path,
        created: res.created || this.currentFileContents.created,
        last_modified: res.last_modified || this.currentFileContents.last_modified,
        size: res.size || this.currentFileContents.size,
        type: res.type || this.currentFileContents.type,
      });
      this.modalService.openModal(SaveFileErrorModal);

      throw new Error('File Save Error');
    }

    await this.createCheckpoint();
  }

  override canRun() {
    if (!this.kernelConnection) {
      alert(l10n.t('Kernel Connection 还没有建立'));
      return false;
    }

    if (this.kernelConnection.isDisposed) {
      alert('Kernel Connection disposed');
      return false;
    }

    return true;
  }

  async interrupt() {
    if (!this.kernelConnection) {
      alert(l10n.t('Kernel Connection 还没有建立'));
      return;
    }
    await this.kernelConnection.interrupt();
  }

  async shutdown() {
    if (!this.kernelConnection) {
      alert(l10n.t('Kernel Connection 还没有建立'));
      return;
    }

    await this.kernelConnectionManager.shutdownKC(this.currentFileContents);
    this.kernelConnection = undefined;
  }

  async restart() {
    if (!this.kernelConnection || this.kernelConnection.isDisposed) {
      this.startKernelConnection();
      getOrigin(this.kcReady)
        .then(() => {
          if (!this.kernelConnection) {
            alert(l10n.t('Kernel Connection 还没有建立'));
            return;
          }
          return;
        })
        .catch(console.error);
      return;
    }

    this.kernelConnection.restart();
  }

  async reconnect() {
    if (!this.kernelConnection) {
      alert(l10n.t('Kernel Connection 还没有建立'));
      return;
    }
    await this.kernelConnection.reconnect();
  }

  findRunningCell() {
    const runningCellIndex = this.cells.findIndex((item) => {
      if (ExecutedWithKernelCellModel.is(item.model)) {
        return item.model.kernelExecuting === true;
      }
      return false;
    });
    if (runningCellIndex > -1) {
      this.selectCell(this.cells[runningCellIndex]);
      this.scrollToView(this.cells[runningCellIndex]);
    }
  }
}
