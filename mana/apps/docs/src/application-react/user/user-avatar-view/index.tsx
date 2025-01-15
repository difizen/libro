import { UserOutlined } from '@ant-design/icons';
import { singleton } from '@difizen/mana-app';
import { ACCOUNTS_MENU, BaseView, view } from '@difizen/mana-app';
import { Avatar } from 'antd';
// import { Dropdown } from '@difizen/mana-react';
import { Dropdown } from 'antd';
import * as React from 'react';
import { forwardRef } from 'react';

import { MenuRender } from '../../workbench/menu/render.js';

import styles from './index.module.less';

export const UserAvatar: React.ForwardRefExoticComponent<any> = forwardRef(
  function UserAvatar(props, ref: React.ForwardedRef<HTMLDivElement>) {
    return (
      <div className={styles.user} ref={ref}>
        <Dropdown trigger={['hover']} overlay={<MenuRender path={ACCOUNTS_MENU} />}>
          <Avatar icon={<UserOutlined />} />
        </Dropdown>
      </div>
    );
  },
);

@singleton()
@view('user-avatar')
export class UserAvatarView extends BaseView {
  override view = UserAvatar;
}
