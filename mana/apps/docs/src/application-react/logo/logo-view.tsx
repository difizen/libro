import { BaseView, view } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import * as React from 'react';

import styles from './index.module.less';
import manaLogo from './mana.svg';

export const Logo = React.forwardRef(function Logo(
  props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={styles.logo} ref={ref}>
      <a href="">
        <img src={manaLogo} alt="" />
      </a>
      <span>Mana-Workbench</span>
    </div>
  );
});

@singleton()
@view('logo-view')
export class LogoView extends BaseView {
  override view = Logo;
}
