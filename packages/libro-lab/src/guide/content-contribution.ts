import type { NotebookModel, NotebookOption } from '@difizen/libro-core';
import { ContentContribution } from '@difizen/libro-core';
import type {
  IContentsModel,
  INotebookContent,
  LibroJupyterModel,
} from '@difizen/libro-jupyter';
import { URI } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { l10n, L10nLang } from '@difizen/mana-l10n';

import contentJson from './libro_guide_book.json';
import contentZhJson from './libro_guide_book_zh.json';

@singleton({ contrib: ContentContribution })
export class LibroGuidebookContentContribution implements ContentContribution {
  canHandle = (options: NotebookOption) => {
    if (options['loadType'] === 'libro-guide-book') {
      return 50;
    }
    return 1;
  };
  async loadContent(options: NotebookOption, model: NotebookModel) {
    const jupyterModel = model as LibroJupyterModel;
    const fireUri = new URI(options['resource']);
    const filePath = fireUri.path.toString();
    let notebookContent: INotebookContent = {
      cells: [],
      metadata: {},
      nbformat: 4,
      nbformat_minor: 5,
    };
    notebookContent = l10n.getLang() === L10nLang.zhCN ? contentZhJson : contentJson;
    const currentFileContents: IContentsModel = {
      name: 'Guide book',
      path: filePath,
      type: 'notebook',
      writable: true,
      created: 'libro',
      last_modified: 'libro',
      content: notebookContent,
    };
    currentFileContents.content.nbformat_minor = 5;
    jupyterModel.currentFileContents = currentFileContents;
    jupyterModel.filePath = currentFileContents.path;
    jupyterModel.lastModified = jupyterModel.currentFileContents.last_modified;

    return jupyterModel.currentFileContents.content;
  }
}
