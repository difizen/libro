import type { NavigatableView } from '@difizen/mana-app';
import {
  inject,
  LabelProvider,
  prop,
  URI,
  URIIconReference,
  ViewOption,
} from '@difizen/mana-app';
import { BaseView, transient, view } from '@difizen/mana-app';
import React from 'react';
import './index.less';

import type { EditorOption } from './protocol.js';
import { LibroDefaultViewerFactory } from './protocol.js';

const DefaultViewerComponent: React.FC = () => {
  return (
    <div className="libro-lab-default-viewer">
      <img
        src="https://mdn.alipayobjects.com/huamei_xt20ge/afts/img/A*BcWvQL6qB0cAAAAAAAAAAAAADiuUAQ/original"
        width={322}
        height={228}
      ></img>
      <div className="libro-lab-default-viewer-text">当前文件类型暂不支持查看</div>
    </div>
  );
};

@transient()
@view(LibroDefaultViewerFactory)
export class LibroDefaultViewer extends BaseView implements NavigatableView {
  override view = DefaultViewerComponent;

  @prop() filePath?: string;

  constructor(
    @inject(ViewOption)
    options: EditorOption,
    @inject(LabelProvider) labelProvider: LabelProvider,
  ) {
    super();
    this.title.caption = options.path;
    this.filePath = options.path;
    const uri = URI.withScheme(new URI(options.path), 'file');
    const uriRef = URIIconReference.create('file', new URI(options.path));
    const iconClass = labelProvider.getIcon(uriRef);
    this.title.icon = <div className={iconClass} />;
    this.title.label = uri.path.base;
  }

  getResourceUri(): URI | undefined {
    return new URI(this.filePath);
  }

  createMoveToUri(resourceUri: URI): URI | undefined {
    this.filePath = resourceUri.path.toString();
    return resourceUri;
  }
}
