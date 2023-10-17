import { Emitter } from '@difizen/mana-app';
import { ThemeService, ViewManager } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';

import type { NotebookOption, NotebookView } from './libro-protocol.js';
import {
  notebookViewFactoryId,
  ModelFactory,
  NotebookService,
} from './libro-protocol.js';
import { LibroViewTracker } from './libro-view-tracker.js';

@singleton({ contrib: NotebookService })
export class LibroService implements NotebookService {
  protected libroModelFactory: ModelFactory;
  protected viewManager: ViewManager;
  protected libroViewTracker: LibroViewTracker;

  protected themeService: ThemeService;
  @prop()
  themeMode: string;
  constructor(
    @inject(ThemeService) themeService: ThemeService,
    @inject(ModelFactory) libroModelFactory: ModelFactory,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(LibroViewTracker) libroViewTracker: LibroViewTracker,
  ) {
    this.themeService = themeService;
    this.themeMode = this.themeService.getCurrentTheme().type;
    this.themeService.onDidColorThemeChange((e) => {
      this.themeMode = e.newTheme.type;
    });
    this.libroModelFactory = libroModelFactory;
    this.viewManager = viewManager;
    this.libroViewTracker = libroViewTracker;
  }

  @prop() protected _active?: NotebookView;
  protected onActiveChangedEmitter: Emitter<NotebookView | undefined> = new Emitter();
  get onActiveChanged() {
    return this.onActiveChangedEmitter.event;
  }
  get active(): NotebookView | undefined {
    return this._active;
  }
  set active(value: NotebookView | undefined) {
    this._active = value;
    this.onActiveChangedEmitter.fire(value);
  }

  @prop() protected _focus?: NotebookView;
  protected onFocusChangedEmitter: Emitter<NotebookView | undefined> = new Emitter();
  get onFocusChanged() {
    return this.onFocusChangedEmitter.event;
  }

  protected onNotebookViewCreatedEmitter: Emitter<NotebookView> = new Emitter();
  get onNotebookViewCreated() {
    return this.onNotebookViewCreatedEmitter.event;
  }

  get focus(): NotebookView | undefined {
    return this._focus;
  }
  set focus(value: NotebookView | undefined) {
    this._focus = value;
    this.onFocusChangedEmitter.fire(value);
  }

  get hasFocus(): boolean {
    return this._hasFocus;
  }

  getViewCache(): Map<string, NotebookView> {
    return this.libroViewTracker.viewCache;
  }

  deleteLibroViewFromCache(instance: NotebookView) {
    this.libroViewTracker.viewCache.delete(instance.id);
    this.libroViewTracker.modelCache.delete(instance.model.id);
  }

  @prop()
  protected _hasFocus = false;

  getOrCreateModel(options: NotebookOption) {
    if (options.modelId) {
      const exist = this.libroViewTracker.modelCache.get(options.modelId);
      if (exist) {
        return exist;
      }
    }
    const model = this.libroModelFactory(options);
    this.libroViewTracker.modelCache.set(model.id, model);
    return model;
  }
  async getOrCreateView(options: NotebookOption): Promise<NotebookView> {
    const model = this.getOrCreateModel(options);
    const notebookViewPromise = this.viewManager.getOrCreateView<NotebookView>(
      notebookViewFactoryId,
      {
        ...(options || {}),
        modelId: model.id,
      },
    );
    const notebookView = await notebookViewPromise;
    this.libroViewTracker.viewCache.set(notebookView.id, notebookView);
    this.onNotebookViewCreatedEmitter.fire(notebookView);
    return notebookViewPromise;
  }

  setActive(view?: NotebookView): void {
    this._active = view;
    this.onActiveChangedEmitter.fire(view);
  }

  setHasFocus(hasFocus: boolean): void {
    this._hasFocus = hasFocus;
  }
}
