import { CloseOutlined } from '@ant-design/icons';
import type { View } from '@difizen/mana-app';
import {
  CardTabView,
  MenuRender,
  transient,
  view,
  ViewContext,
  Saveable,
} from '@difizen/mana-app';
import { Dropdown } from '@difizen/mana-react';
import { Badge } from 'antd';
import classnames from 'classnames';

@transient()
@view('LibroLabSaveableTab')
export class SaveableTabView extends CardTabView {
  protected override renderTab(item: View) {
    return (
      <ViewContext view={item}>
        <Dropdown
          trigger={['contextMenu']}
          overlay={<MenuRender menuPath={['tab-bar-context-menu']} data={undefined} />}
        >
          <div
            title={item.title.caption}
            className={classnames('mana-tab-title', item.title.className)}
          >
            {item.title.icon && (
              <span className="mana-tab-icon">
                {this.renderTitleIcon(item.title.icon)}
              </span>
            )}
            {this.renderTitleLabel(item.title.label)}
            {this.renderTail(item)}
          </div>
        </Dropdown>
      </ViewContext>
    );
  }
  protected renderTail(item: View) {
    const isDirty = Saveable.is(item) && Saveable.isDirty(item);
    return (
      <div className="libro-lab-editor-tab-tail">
        {isDirty ? (
          <div className="libro-lab-editor-tab-dirty">
            <Badge status="default" />
          </div>
        ) : (
          item.title.closable && (
            <CloseOutlined
              onClick={(e) => {
                e.stopPropagation();
                this.close(item);
                if (this.children.length > 0) {
                  this.active = this.children[this.children.length - 1];
                }
              }}
              className="mana-tab-close"
            />
          )
        )}
      </div>
    );
  }
}
