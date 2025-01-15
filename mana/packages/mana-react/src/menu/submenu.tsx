import * as React from 'react';

import { MenuContext } from './context';
import type { MenuItemProps } from './item';
import { getProps, getContent } from './item';
import './styles/index.less';

const noop = () => {
  //
};

export const MenuSubMenu: React.FC<MenuItemProps> = (props) => {
  const { hotkey, children, ...others } = props;
  const context = React.useContext(MenuContext);
  const { prefixCls } = context;
  const wrapProps = getProps({ ...props }, context, `${prefixCls}-submenu`);
  return (
    <div {...wrapProps}>
      {getContent(
        { ...others },
        context,
        noop,
        <span className={`${prefixCls}-submenu-arrow`} />,
        <div className={`${prefixCls}-submenu-menu`}>{children}</div>,
      )}
    </div>
  );
};
