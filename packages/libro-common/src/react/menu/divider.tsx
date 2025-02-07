import * as React from 'react';

import { MenuContext } from './context';

export const MenuDivider: React.FC = () => {
  const context = React.useContext(MenuContext);
  const { prefixCls } = context;
  return <div className={`${prefixCls}-item ${prefixCls}-item-divider`} />;
};
