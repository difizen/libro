import type { FC } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import './index.less';
import type { MarkdownCellView } from './markdown-cell-view.js';

export const MarkdownPreview: FC<{ instance: MarkdownCellView }> = ({ instance }) => {
  const mktRef = useRef<HTMLDivElement>(null);
  // const instance = useInject<MarkdownCellView>(ViewInstance);

  const enterEdit: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (instance.parent.model.readOnly) {
        return;
      }
      e.preventDefault();
      instance.focus(true);
    },
    [instance],
  );

  useEffect(() => {
    if (mktRef.current) {
      mktRef.current.innerHTML = instance.markdownParser.render(instance.model.value, {
        cellId: instance.model.id,
      });
    }
  }, [instance, instance.model.value]);

  return (
    <div className="libro-markdown-warpper-container" onDoubleClick={enterEdit}>
      <div className="libro-markdown-preview" ref={mktRef} />
    </div>
  );
};
