import type { LibroView } from '@difizen/libro-jupyter';
import { PlusOutlined } from '@difizen/libro-jupyter';
import { ArrowDown, ArrowRight, CellCollapsible } from '@difizen/libro-jupyter';
import { ExecutableCellView } from '@difizen/libro-jupyter';
import { LibroService } from '@difizen/libro-jupyter';
import type { NavigatableView } from '@difizen/mana-app';
import {
  BaseView,
  inject,
  ViewRender,
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
import { l10n } from '@difizen/mana-l10n';
import type { RadioChangeEvent } from 'antd';
import { Radio, Button } from 'antd';
import type { ReactElement } from 'react';
import { forwardRef } from 'react';
import './index.less';

import { AppViewerFactory } from './protocol.js';

export const AppViewerComponent = forwardRef(function LibroEditorComponent() {
  const instance = useInject<LibroAppViewer>(ViewInstance);

  if (!instance.libroView || !instance.libroView.view) {
    return null;
  }

  const handleSizeChange = (e: RadioChangeEvent) => {
    instance.mode = e.target.value;
  };
  let children: ReactElement | null = null;
  if (instance.mode === 'notebook') {
    children = instance.libroView ? (
      <ViewRender view={instance.libroView}></ViewRender>
    ) : null;
  } else {
    children = (
      <div className="libro-app-cell-list">
        {instance.libroView?.model.cells.map((cell) => {
          if (ExecutableCellView.is(cell)) {
            return <ViewRender view={cell.outputArea} key={cell.id}></ViewRender>;
          } else {
            const isCollapsible = CellCollapsible.is(cell);
            return (
              <>
                {instance.libroView?.collapserVisible && isCollapsible && (
                  <div className="libro-app-cell-container">
                    <div
                      className="libro-markdown-collapser"
                      onClick={() => {
                        instance.libroView?.collapseCell(cell, !cell.headingCollapsed);
                      }}
                    >
                      {cell.headingCollapsed ? <ArrowRight /> : <ArrowDown />}
                    </div>
                    <ViewRender view={cell}></ViewRender>
                    {isCollapsible &&
                      cell.headingCollapsed &&
                      cell.collapsibleChildNumber > 0 && (
                        <div className="libro-cell-collapsed-expander">
                          <Button
                            className="libro-cell-expand-button"
                            onClick={() =>
                              instance.libroView?.collapseCell(cell, false)
                            }
                            icon={<PlusOutlined className="" />}
                            type="default"
                          >
                            {cell.collapsibleChildNumber} cell hidden
                          </Button>
                        </div>
                      )}
                  </div>
                )}
              </>
            );
          }
        })}
      </div>
    );
  }
  return (
    <div className="libro-app-container">
      <div className="libro-app-container-header">
        <Radio.Group value={instance.mode} onChange={handleSizeChange}>
          <Radio.Button value="app">{l10n.t('报告预览')}</Radio.Button>
          <Radio.Button value="notebook">notebook</Radio.Button>
        </Radio.Group>
      </div>
      <div className="libro-app-container-content">{children}</div>
    </div>
  );
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

  @prop()
  mode = 'app';

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
