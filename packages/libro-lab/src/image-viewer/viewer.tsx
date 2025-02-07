import { ContentsManager } from '@difizen/libro-kernel';
import type { NavigatableView } from '@difizen/libro-common/app';
import { DisposableCollection } from '@difizen/libro-common/app';
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
} from '@difizen/libro-common/app';
import { Spin } from 'antd';
import { createRef, forwardRef, useEffect, useRef } from 'react';
import Viewer from 'viewerjs';
import './index.less';
import 'viewerjs/dist/viewer.css';

export function ImageViewer() {
  const instance = useInject<NavigatableImageViewerView>(ViewInstance);
  const ref = useRef<HTMLImageElement>(null);
  const content = instance.content;
  useEffect(() => {
    if (ref && ref.current) {
      new Viewer(ref.current, {
        toolbar: {
          prev: 0,
          next: 0,
          zoomIn: 4,
          zoomOut: 4,
          oneToOne: 4,
          reset: 4,
          play: {
            show: 4,
            size: 'large',
          },
          rotateLeft: 4,
          rotateRight: 4,
          flipHorizontal: 4,
          flipVertical: 4,
        },
      });
    }
  }, [content, ref]);
  if (!content) {
    return null;
  }
  return <img ref={ref} src={`data:image/png;base64,${content}`} />;
}

export const NavigatableImageViewerComponent = forwardRef<HTMLDivElement>(
  function LibroEditorComponent(props, ref) {
    const instance = useInject<NavigatableImageViewerView>(ViewInstance);
    const content = instance.content;
    return (
      <Spin spinning={!content}>
        <div className="libro-lab-image-viewer" ref={ref}>
          {content && <ImageViewer />}
        </div>
      </Spin>
    );
  },
);

export const NavigatableImageViewerViewFactoryId =
  'navigatable-image-viewer-view-factory';
@transient()
@view(NavigatableImageViewerViewFactoryId)
export class NavigatableImageViewerView extends BaseView implements NavigatableView {
  @inject(CommandRegistry) commandRegistry: CommandRegistry;
  @inject(ContentsManager) contentsManager: ContentsManager;

  protected readonly toDisposeOnAutoSave = new DisposableCollection();

  override view = NavigatableImageViewerComponent;

  codeRef = createRef<HTMLDivElement>();

  @prop() filePath?: string;
  @prop() content?: string;

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

  getFileContent = async () => {
    if (this.filePath) {
      const content = await this.contentsManager.get(this.filePath, {
        content: true,
        format: 'base64',
      });
      this.content = content.content;
    }
  };

  override async onViewMount(): Promise<void> {
    this.getFileContent();
  }

  getResourceUri(): URI | undefined {
    return new URI(this.filePath);
  }

  createMoveToUri(resourceUri: URI): URI | undefined {
    this.filePath = resourceUri.path.toString();
    return resourceUri;
  }
}
