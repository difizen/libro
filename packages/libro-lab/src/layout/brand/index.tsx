import { BaseView, view, singleton } from '@difizen/mana-app';
import * as React from 'react';

import { Logo } from './logo.js';

export const Brand: React.ForwardRefExoticComponent<any> = React.forwardRef(
  function Brand(_props, ref: React.ForwardedRef<HTMLDivElement>) {
    return (
      <div className="libro-lab-brand" ref={ref}>
        <Logo className="libro-lab-brand-logo" />
      </div>
    );
  },
);

@singleton()
@view('libro-brand-view')
export class BrandView extends BaseView {
  override view = Brand;
}
