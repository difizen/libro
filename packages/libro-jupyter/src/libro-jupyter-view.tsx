import type { NotebookOption } from '@difizen/libro-core';
import { VirtualizedManagerHelper } from '@difizen/libro-core';
import { CollapseServiceFactory, NotebookService } from '@difizen/libro-core';
import { LibroView, notebookViewFactoryId } from '@difizen/libro-core';
import { URI, view, ViewOption } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';

@transient()
@view(notebookViewFactoryId)
export class LibroJupyterView extends LibroView {
  uri: URI;
  constructor(
    @inject(ViewOption) options: NotebookOption,
    @inject(CollapseServiceFactory) collapseServiceFactory: CollapseServiceFactory,
    @inject(NotebookService) notebookService: NotebookService,
    @inject(VirtualizedManagerHelper)
    virtualizedManagerHelper: VirtualizedManagerHelper,
  ) {
    super(options, collapseServiceFactory, notebookService, virtualizedManagerHelper);
    const uri = new URI(options['resource']);
    this.uri = uri;
    this.title.label = uri.displayName;
  }
  get options() {
    return this.model.options;
  }
}
