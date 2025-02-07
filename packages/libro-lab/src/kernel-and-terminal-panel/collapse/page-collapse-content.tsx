import { CloseOutlined } from '@ant-design/icons';
import {
  renderNode,
  useInject,
  ViewContext,
  ViewInstance,
} from '@difizen/libro-common/mana-app';

import type { SaveableTabView } from '../../index.js';

export const OpenedTabs: React.FC = () => {
  const tabs = useInject<SaveableTabView>(ViewInstance);

  const renderTitleIcon = renderNode;
  const renderTitleLabel = renderNode;

  return (
    <>
      {tabs.children.map((item) => {
        return (
          <ViewContext view={item} key={item.id}>
            <div
              title={item.title.caption}
              className="libro-panel-collapse-item"
              onClick={() => {
                tabs.onChange(item.id);
              }}
            >
              {item.title.icon && (
                <span className="libro-panel-collapse-item-icon">
                  {renderTitleIcon(item.title.icon)}
                </span>
              )}
              <div className="libro-panel-collapse-item-label">
                {renderTitleLabel(item.title.label)}
              </div>
              {item.title.closable && (
                <div
                  className="libro-panel-collapse-item-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    item.dispose();
                  }}
                >
                  <CloseOutlined />
                </div>
              )}
            </div>
          </ViewContext>
        );
      })}
    </>
  );
};
