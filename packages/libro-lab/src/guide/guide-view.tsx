import type { LibroView } from '@difizen/libro-jupyter';
import { LibroService } from '@difizen/libro-jupyter';
import {
  Deferred,
  inject,
  prop,
  singleton,
  useInject,
  view,
  ViewInstance,
  ViewRender,
} from '@difizen/libro-common/mana-app';
import { BaseView } from '@difizen/libro-common/mana-app';
import { l10n, L10nLang } from '@difizen/libro-common/l10n';
import { forwardRef } from 'react';
import './index.less';

import { Logo } from '../common/icon.js';

export const GuideComponent = forwardRef(function WelcomeComponent() {
  const instance = useInject<GuideView>(ViewInstance);

  if (!instance.libroView) {
    return null;
  }
  return <ViewRender view={instance.libroView} key={instance.filePath} />;
});

@singleton()
@view('guide-view')
export class GuideView extends BaseView {
  override view = GuideComponent;

  @prop()
  libroView?: LibroView;

  @prop() filePath?: string;

  @inject(LibroService) protected libroService: LibroService;

  protected defer = new Deferred<void>();

  get ready() {
    return this.defer.promise;
  }

  constructor() {
    super();
    this.title.icon = <Logo></Logo>;
    this.title.label = () => <div>{l10n.t('使用指南')}</div>;
    this.title.closable = true;
    this.filePath =
      l10n.getLang() === L10nLang.zhCN
        ? 'libro_guide_book_zh.json'
        : 'libro_guide_book.json';
  }

  override async onViewMount(): Promise<void> {
    this.getOrCreateLibroView();
  }

  protected async getOrCreateLibroView() {
    const libroView = await this.libroService.getOrCreateView({
      id: this.filePath,
      resource: this.filePath,
      loadType: 'libro-guide-book',
    });
    if (!libroView) {
      return;
    }
    this.libroView = libroView;
    await this.libroView.initialized;
    this.libroView.model.savable = false;
    this.libroView.focus();
    this.defer.resolve();
  }
}
