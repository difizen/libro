import { Disposable } from '@difizen/mana-common';
import { notification } from '@difizen/mana-react';
import { singleton } from '@difizen/mana-syringe';
import { v1 } from 'uuid';

import type { NotificationConfig, NotificationAction } from './protocol';

import './index.less';

const NotificationContent = (props: NotificationConfig) => {
  const actions: NotificationAction[] = props.actions || [];
  return (
    <div className="mana-notification-content">
      {props.description || ''}
      <div className="mana-notification-content-actions">
        {actions.map((item) => {
          return (
            <button
              className="mana-notification-content-actions-item"
              key={item.key}
              onClick={(e) => {
                props.onAction?.(e, item);
              }}
            >
              {item.label || item.key}
            </button>
          );
        })}
      </div>
    </div>
  );
};

@singleton()
export class NotificationService {
  open(config: NotificationConfig): Disposable {
    let key = config.key;
    if (!key) {
      key = v1();
    }
    const description = <NotificationContent {...config} />;
    notification.open({ ...config, key, description });
    return Disposable.create(() => {
      notification.destroy(key);
    });
  }
  warning(config: NotificationConfig): Disposable {
    return this.open({ ...config, type: 'warning' });
  }
  info(config: NotificationConfig): Disposable {
    return this.open({ ...config, type: 'info' });
  }
  success(config: NotificationConfig): Disposable {
    return this.open({ ...config, type: 'success' });
  }
  error(config: NotificationConfig): Disposable {
    return this.open({ ...config, type: 'error' });
  }
}
