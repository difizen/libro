import type { LibroView } from '@difizen/libro-core';
import { LibroService, DocumentCommands } from '@difizen/libro-core';
import type { NavigatableView, Saveable } from '@difizen/mana-app';
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
  ViewRender,
  Deferred,
  URI,
  CommandRegistry,
  Emitter,
} from '@difizen/mana-app';
import { createRef, forwardRef } from 'react';

export const LibroEditorComponent = forwardRef(function LibroEditorComponent() {
  const instance = useInject<LibroNavigatableView>(ViewInstance);

  if (!instance.libroView || !instance.libroView.view) {
    return null;
  }

  return <ViewRender view={instance.libroView} key={instance.filePath} />;
});

export const LibroNavigatableViewFactoryId = 'libro-navigatable-view-factory';
@transient()
@view(LibroNavigatableViewFactoryId)
export class LibroNavigatableView
  extends BaseView
  implements NavigatableView, Saveable
{
  @inject(LibroService) protected libroService: LibroService;

  @inject(CommandRegistry) commandRegistry: CommandRegistry;

  override view = LibroEditorComponent;

  codeRef = createRef<HTMLDivElement>();

  @prop() filePath?: string;

  dirtyEmitter = new Emitter<void>();

  get onDirtyChanged() {
    return this.dirtyEmitter.event;
  }

  readonly autoSave = 'off';

  @prop()
  dirty: boolean;

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
    this.dirty = false;
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

  save = () => {
    this.commandRegistry.executeCommand(
      DocumentCommands['Save'].id,
      undefined,
      this.libroView,
    );
  };

  protected async getOrCreateLibroView() {
    const libroView = await this.libroService.getOrCreateView({
      id: this.filePath,
      resource: this.filePath,
    });
    if (!libroView) {
      return;
    }
    this.libroView = libroView;
    this.libroView.model.onContentChanged(() => {
      this.dirty = true;
      this.dirtyEmitter.fire();
    });
    this.libroView.onSave(() => {
      this.dirty = false;
      this.dirtyEmitter.fire();
    });
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
