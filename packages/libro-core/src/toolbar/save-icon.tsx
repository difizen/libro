import {
  SaveOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useInject, ViewInstance } from '@difizen/mana-app';
import type { Disposable } from '@difizen/mana-app';
import type { FC } from 'react';
import { useEffect, useCallback, useState } from 'react';

import type { LibroView } from '../libro-view.js';

export const SaveIcon: FC = () => {
  const [saved, setSaved] = useState<boolean | undefined>(undefined);
  const libroView = useInject<LibroView>(ViewInstance);

  const handleSave = useCallback((result: boolean) => {
    setSaved(result);
    setTimeout(() => {
      setSaved(undefined);
    }, 500);
  }, []);

  useEffect(() => {
    let toDispose: Disposable;
    if (libroView) {
      toDispose = libroView.onSave((result) => {
        handleSave(result);
      });
    }
    return () => {
      toDispose?.dispose();
    };
  }, [handleSave, libroView]);
  if (saved !== undefined) {
    if (saved) {
      return <CheckOutlined style={{ color: 'green' }} />;
    } else {
      return <CloseOutlined style={{ color: 'red' }} />;
    }
  }
  if (libroView?.saving) {
    return <LoadingOutlined />;
  }
  return <SaveOutlined />;
};
