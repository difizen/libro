import type { LibroView } from '@difizen/libro-jupyter';
import { LibroService } from '@difizen/libro-jupyter';
import type { NavigatableView } from '@difizen/mana-app';
import {
  BaseView,
  inject,
  LabelProvider,
  prop,
  transient,
  URI as VScodeURI,
  URIIconReference,
  useInject,
  view,
  ViewInstance,
  ViewOption,
  Deferred,
  URI,
  CommandRegistry,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

import { AppViewerFactory } from './protocol.js';

export const AppViewerComponent = forwardRef(function LibroEditorComponent() {
  const instance = useInject<LibroAppViewer>(ViewInstance);

  if (!instance.libroView || !instance.libroView.view) {
    return null;
  }

  return <div>app 测试</div>;
});

@transient()
@view(AppViewerFactory)
export class LibroAppViewer extends BaseView implements NavigatableView {
  @inject(LibroService) protected libroService: LibroService;

  @inject(CommandRegistry) commandRegistry: CommandRegistry;

  override view = AppViewerComponent;

  @prop() filePath?: string;

  @prop()
  libroView?: LibroView;

  protected defer = new Deferred<void>();

  get ready() {
    return this.defer.promise;
  }

  constructor(
    @inject(ViewOption) options: { path: string },
    @inject(LabelProvider) labelProvider: LabelProvider,
  ) {
    super();
    this.filePath = options.path;
    this.title.caption = options.path;
    const uri = new URI(options.path);
    const uriRef = URIIconReference.create('file', new VScodeURI(options.path));
    const iconClass = labelProvider.getIcon(uriRef);
    this.title.icon = <div className={iconClass} />;
    this.title.label = uri.displayName;
  }

  override async onViewMount(): Promise<void> {
    this.getOrCreateLibroView();
  }

  protected async getOrCreateLibroView() {
    const libroView = await this.libroService.getOrCreateView({
      id: this.filePath,
      resource: this.filePath,
    });
    if (!libroView) {
      return;
    }
    this.libroView = libroView;
    await this.libroView.initialized;
    this.libroView.focus();
    this.defer.resolve();
  }

  getResourceUri(): URI | undefined {
    return new URI(this.filePath);
  }

  createMoveToUri(resourceUri: URI): URI | undefined {
    this.filePath = resourceUri.path.toString();
    this.getOrCreateLibroView();
    return resourceUri;
  }
}
