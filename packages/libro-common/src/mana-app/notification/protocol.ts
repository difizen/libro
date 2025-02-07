import type { NotificationArgsProps } from '../../react/index.js';
import type { ReactNode } from 'react';

export interface NotificationAction {
  key: string;
  label?: string;
}

export interface NotificationConfig extends NotificationArgsProps {
  key?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  message: ReactNode;
  description?: ReactNode;
  actions?: NotificationAction[];
  onAction?: (e: any, action: NotificationAction) => void;
}
