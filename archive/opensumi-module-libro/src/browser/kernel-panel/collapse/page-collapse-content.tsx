/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { CloseOutlined } from '@ant-design/icons';
import type { URI } from '@opensumi/ide-core-browser';
import { useInjectable } from '@opensumi/ide-core-browser';
import type { IResource } from '@opensumi/ide-editor';
import { ResourceService, WorkbenchEditorService } from '@opensumi/ide-editor';
import type { WorkbenchEditorServiceImpl } from '@opensumi/ide-editor/lib/browser/workbench-editor.service';
import React, { useEffect, useState } from 'react';

export const OpenedTab: React.FC<{ item: URI; refresh: () => void }> = ({
  item,
  refresh,
}) => {
  const [resource, setResource] = useState<IResource>();
  const resourceService = useInjectable<ResourceService>(ResourceService);
  const editorService = useInjectable<WorkbenchEditorServiceImpl>(
    WorkbenchEditorService,
  );

  useEffect(() => {
    resourceService.getResource(item).then((resource) => {
      if (resource !== null) {
        setResource(resource);
      }
    });
  }, [item, resourceService]);

  return (
    <div
      title={item.displayName}
      className="libro-panel-collapse-item"
      // onClick={() => {
      //   tabs.onChange(item.id);
      // }}
    >
      {resource?.icon && (
        <span
          className={`libro-panel-collapse-item-icon ${resource.icon}`}
        ></span>
      )}
      <div className="libro-panel-collapse-item-label">{item.displayName}</div>
      <div
        className="libro-panel-collapse-item-close"
        onClick={(e) => {
          e.stopPropagation();
          editorService.close(item).then(() => {
            refresh();
          });
        }}
      >
        <CloseOutlined />
      </div>
    </div>
  );
};

export const OpenedTabs: React.FC<{ refresh: () => void }> = ({ refresh }) => {
  const editorService = useInjectable<WorkbenchEditorServiceImpl>(
    WorkbenchEditorService,
  );
  const openedUris = editorService.getAllOpenedUris();

  return (
    <div>
      {openedUris.map((item) => {
        return (
          <OpenedTab
            item={item}
            refresh={refresh}
            key={item.toString()}
          ></OpenedTab>
        );
      })}
    </div>
  );
};
