import { FileOutlined } from '@ant-design/icons';
import type { NavigatableView } from '@difizen/mana-app';
import { BaseView, view, ViewInstance, ViewOption } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import { prop, useInject } from '@difizen/mana-app';
import { URI } from '@difizen/mana-app';
import * as React from 'react';
import { forwardRef } from 'react';

import styles from './index.module.less';

export const Logo = forwardRef(function Logo(
  props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const viewInstance = useInject<ContentView>(ViewInstance);
  return (
    <div className={styles.content} ref={ref}>
      <div>${viewInstance.filePath}</div>
    </div>
  );
});

export const Lable = () => {
  const viewInstance = useInject<ContentView>(ViewInstance);
  return (
    <div className={styles.label}>
      <span>{viewInstance.filePath}</span>
      <span>{viewInstance.time}</span>
    </div>
  );
};

@transient()
@view('content-view')
export class ContentView extends BaseView implements NavigatableView {
  @prop() filePath?: string;
  @prop() time = 0;
  protected options: any;
  override view = Logo;
  constructor(@inject(ViewOption) options: any) {
    super();
    this.options = options;
    this.title.icon = FileOutlined;
    this.filePath = options.path;
    this.title.label = Lable;
    this.title.caption = options.path;
    this.title.className = styles.title;
    if (this.filePath?.endsWith('.py')) {
      setInterval(() => {
        this.time += 1;
      }, 1000);
    }
  }
  getResourceUri(): URI | undefined {
    return new URI(this.options.path);
  }
  createMoveToUri(resourceUri: URI): URI | undefined {
    return resourceUri;
  }
}
