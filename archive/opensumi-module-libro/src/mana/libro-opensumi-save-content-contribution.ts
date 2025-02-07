import type { LibroJupyterModel, NotebookOption } from '@difizen/libro-jupyter';
import {
  ContentSaveContribution,
  SaveFileErrorModal,
} from '@difizen/libro-jupyter';
import {
  getOrigin,
  inject,
  ModalService,
  singleton,
  URI,
} from '@difizen/mana-app';
import type { Injector } from '@opensumi/di';
import { IFileServiceClient } from '@opensumi/ide-file-service';

import { ContentLoaderType, OpensumiInjector } from '../common';

@singleton({ contrib: ContentSaveContribution })
export class LibroOpensumiContentSaveContribution
  implements ContentSaveContribution
{
  @inject(ModalService) protected readonly modalService: ModalService;
  @inject(OpensumiInjector) injector: Injector;

  canHandle = (options: NotebookOption) => {
    return options.loadType === ContentLoaderType ? 100 : 1;
  };
  saveContent = async (options: NotebookOption, model: LibroJupyterModel) => {
    const uri = new URI(options.resource.toString());
    const fileServiceClient: IFileServiceClient = getOrigin(
      this.injector.get(IFileServiceClient),
    );
    const stat = await getOrigin(fileServiceClient).getFileStat(
      options.resource.toString(),
    );
    try {
      const notebookContent = model.toJSON();
      if (!stat) {
        throw new Error('Get file stat error!');
      }
      getOrigin(fileServiceClient).setContent(
        stat,
        JSON.stringify(notebookContent),
      );
    } catch (e: any) {
      model.fileService.fileSaveErrorEmitter.fire({
        cause: e.errorCause,
        msg: e.message,
        name: uri.path?.name || model.currentFileContents.name,
        path: uri?.path.toString() || model.currentFileContents.path,
        created:
          stat?.createTime?.toString() || model.currentFileContents.created,
        last_modified:
          stat?.lastModification.toString() ||
          model.currentFileContents.last_modified,
        size: stat?.size || model.currentFileContents.size,
        type: 'notebook' || model.currentFileContents.type,
      });
      this.modalService.openModal(SaveFileErrorModal);
      throw new Error('File Save Error', e);
    }
  };
}
