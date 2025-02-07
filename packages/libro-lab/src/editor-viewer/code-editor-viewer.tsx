import { EditorProvider, MonacoEnvironment } from '@difizen/libro-cofine-editor-core';
import type { LanguageSpec, MonacoEditorOptions } from '@difizen/libro-jupyter';
import { LibroConfigAutoSave } from '@difizen/libro-jupyter';
import { MonacoUri } from '@difizen/libro-jupyter';
import { JupyterFileService, LanguageSpecRegistry } from '@difizen/libro-jupyter';
import type { NavigatableView, Saveable } from '@difizen/libro-common/mana-app';
import { ConfigurationService } from '@difizen/libro-common/mana-app';
import { Disposable } from '@difizen/libro-common/mana-app';
import {
  DisposableCollection,
  Emitter,
  getOrigin,
  inject,
  LabelProvider,
  prop,
  URI,
  URIIconReference,
  ViewOption,
} from '@difizen/libro-common/mana-app';
import {
  BaseView,
  transient,
  useInject,
  view,
  ViewInstance,
} from '@difizen/libro-common/mana-app';
import React from 'react';
import './index.less';

import type { EditorOption } from './protocol.js';
import { CodeEditorViewerFactory } from './protocol.js';

const EditorComponent: React.FC = () => {
  const viewInstance = useInject<CodeEditorViewer>(ViewInstance);
  return <div className="libro-lab-editor-viewer" ref={viewInstance.codeRef}></div>;
};

type EditorType = ReturnType<EditorProvider['create']>;
export const LibroLabE2URIScheme = 'libro-lab-e2';

@transient()
@view(CodeEditorViewerFactory)
export class CodeEditorViewer extends BaseView implements NavigatableView, Saveable {
  override view = EditorComponent;

  codeRef = React.createRef<HTMLDivElement>();

  protected e2Editor?: EditorType;

  @prop()
  dirty = false;

  language = 'text';

  value: string;

  @prop() filePath?: string;

  autoSaveDelay = 1000;

  dirtyEmitter = new Emitter<void>();

  languageSpecRegistry: LanguageSpecRegistry;

  get onDirtyChanged() {
    return this.dirtyEmitter.event;
  }

  autoSave: 'on' | 'off' = 'off';

  protected readonly toDisposeOnAutoSave = new DisposableCollection();

  languageSpec?: LanguageSpec;

  fileService: JupyterFileService;

  constructor(
    @inject(ViewOption)
    options: EditorOption,
    @inject(LabelProvider) labelProvider: LabelProvider,
    @inject(JupyterFileService) fileService: JupyterFileService,
    @inject(LanguageSpecRegistry)
    languageSpecRegistry: LanguageSpecRegistry,
    @inject(ConfigurationService) configurationService: ConfigurationService,
  ) {
    super();
    this.filePath = options.path;
    this.title.caption = options.path;
    const uri = new URI(options.path);
    const uriRef = URIIconReference.create('file', new URI(options.path));
    const iconClass = labelProvider.getIcon(uriRef);
    this.fileService = fileService;
    this.title.icon = <div className={iconClass} />;
    this.title.label = uri.path.base;
    this.languageSpecRegistry = languageSpecRegistry;
    this.languageSpec = this.languageSpecRegistry.languageSpecs.find((item) =>
      item.ext.includes(uri.path.ext.toLowerCase()),
    );
    configurationService
      .get(LibroConfigAutoSave)
      .then((value) => {
        if (value) {
          this.autoSave = 'on';
          return;
        } else {
          this.autoSave = 'off';
          return;
        }
      })
      .catch(() => {
        //
      });
  }

  override async onViewMount() {
    if (!this.filePath) {
      return;
    }
    const content = await getOrigin(this.fileService).read(this.filePath);
    if (typeof content !== 'string') {
      return;
    }
    if (!this.codeRef || !this.codeRef.current) {
      return;
    }

    await MonacoEnvironment.init();
    const editorPorvider =
      MonacoEnvironment.container.get<EditorProvider>(EditorProvider);

    const uri = MonacoUri.from({
      scheme: LibroLabE2URIScheme,
      path: `${this.filePath}${this.languageSpec?.ext[0]}`,
    });

    const options: MonacoEditorOptions = {
      /**
       * language ia an uri:
       */
      theme: 'libro-light',
      language: this.languageSpec?.language || 'markdown',
      uri,
      value: content,
    };
    this.e2Editor = editorPorvider.create(this.codeRef.current, options);

    this.toDispose.push(
      getOrigin(this.e2Editor.codeEditor).onDidChangeModelContent(() => {
        this.dirty = true;
        if (this.autoSave === 'on') {
          this.doAutoSave();
        }
      }),
    );
  }

  protected doAutoSave = () => {
    this.toDisposeOnAutoSave.dispose();
    if (!this.e2Editor) {
      return;
    }
    const handle = window.setTimeout(async () => {
      this.save();
    }, this.autoSaveDelay);
    this.toDisposeOnAutoSave.push(Disposable.create(() => window.clearTimeout(handle)));
  };

  save = async () => {
    this.value = this.e2Editor?.codeEditor.getValue() || '';
    await this.fileService.write(this.filePath!, this.value);
    this.dirty = false;
  };

  getResourceUri(): URI | undefined {
    return new URI(this.filePath);
  }

  override onViewResize = () => {
    if (!this.e2Editor) {
      return;
    }
    this.e2Editor.codeEditor.layout();
  };

  createMoveToUri(resourceUri: URI): URI | undefined {
    this.filePath = resourceUri.path.toString();
    return resourceUri;
  }

  override dispose(): void {
    this.toDispose.dispose();
    this.toDisposeOnAutoSave.dispose();
    super.dispose();
  }
}
