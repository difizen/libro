import type { ModalItemView } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { ModalService } from '@difizen/mana-app';
import { ConfigProvider, theme } from 'antd';
import React from 'react';

@singleton()
export class MyModalService extends ModalService {
  override renderModal(itemView: ModalItemView): React.ReactNode {
    const children = super.renderModal(itemView);
    if (itemView.modalData === 'a new modal!') {
      return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
          {children}
        </ConfigProvider>
      );
    }
    return children;
  }
}
