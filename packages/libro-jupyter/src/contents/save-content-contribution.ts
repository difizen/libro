import type { NotebookOption } from '@difizen/libro-core';
import { ContentSaveContribution } from '@difizen/libro-core';
import type { IContentsModel } from '@difizen/libro-kernel';
import { ModalService, inject, singleton } from '@difizen/mana-app';

import type { LibroJupyterModel } from '../libro-jupyter-model.js';
import { SaveFileErrorModal } from '../toolbar/save-file-error.js';

@singleton({ contrib: ContentSaveContribution })
export class LibroJupyterContentSaveContribution implements ContentSaveContribution {
  @inject(ModalService) protected readonly modalService: ModalService;

  canHandle = () => {
    return 2;
  };
  saveContent = async (options: NotebookOption, model: LibroJupyterModel) => {
    const notebookContent = model.toJSON();
    if (!model.currentFileContents) {
      throw new Error('currentFileContents is undefined');
    }

    let res = {} as IContentsModel | undefined;

    try {
      res = await model.fileService.write(notebookContent, model.currentFileContents);
      if (!res) {
        return;
      }
      // 文件保存失败
      if (res.last_modified === model.lastModified || res.size === 0) {
        const errorMsg = `File Save Error: ${res?.message} `;
        model.fileService.fileSaveErrorEmitter.fire({
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
      model.fileService.fileSaveErrorEmitter.fire({
        cause: e.errorCause,
        msg: e.message,
        name: res.name || model.currentFileContents.name,
        path: res.path || model.currentFileContents.path,
        created: res.created || model.currentFileContents.created,
        last_modified: res.last_modified || model.currentFileContents.last_modified,
        size: res.size || model.currentFileContents.size,
        type: res.type || model.currentFileContents.type,
      });
      this.modalService.openModal(SaveFileErrorModal);

      throw new Error('File Save Error');
    }

    await model.createCheckpoint();
  };
}
