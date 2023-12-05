import { singleton, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { Col, Row } from 'antd';
import { forwardRef } from 'react';
import {
  KeybindIcon,
  MoreIcon,
  NotebookIcon,
  PreferenceIcon,
  PythonIcon,
  SQLIcon,
  TerminalIcon,
} from '../common/icon.js';

import './index.less';

export const EntryPointComponent = forwardRef(function EntryPointComponent() {
  return (
    <div className="libro-lab-entry-point">
      <div className="libro-lab-entry-point-title">请选择你要创建的文件类型：</div>
      <div className="libro-lab-entry-point-item-title">文件</div>
      <Row>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '32px' }}
        >
          <div className="libro-lab-entry-point-item">
            <NotebookIcon />
            <span className="libro-lab-entry-point-item-text">Notebook</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '32px' }}
        >
          <div className="libro-lab-entry-point-item">
            <PythonIcon />
            <span className="libro-lab-entry-point-item-text">Python</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '32px' }}
        >
          <div className="libro-lab-entry-point-item">
            <SQLIcon />
            <span className="libro-lab-entry-point-item-text">SQL</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '32px' }}
        >
          <div className="libro-lab-entry-point-item">
            <MoreIcon />
            <span className="libro-lab-entry-point-item-text">其他</span>
          </div>
        </Col>
      </Row>
      <div className="libro-lab-entry-point-item-title">其他</div>
      <Row>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '32px' }}
        >
          <div className="libro-lab-entry-point-item">
            <TerminalIcon />
            <span className="libro-lab-entry-point-item-text">Terminal</span>
          </div>
        </Col>
      </Row>
      {/* <div className="libro-lab-entry-point-item-title">最近使用</div>
      <Row>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '24px' }}
        >
          <div className="libro-lab-entry-point-item-recent">
            <span className="libro-lab-entry-point-item-recent-icon">📋 </span>
            <span className="libro-lab-entry-point-item-recent-text">
              这是一个文件名
            </span>
          </div>
        </Col>
      </Row> */}
      <div className="libro-lab-entry-point-item-title">系统设置</div>
      <Row>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '24px' }}
        >
          <div className="libro-lab-entry-point-item-config">
            <PreferenceIcon></PreferenceIcon>
            <span className="libro-lab-entry-point-item-config-text">偏好设置</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '24px' }}
        >
          <div className="libro-lab-entry-point-item-config">
            <KeybindIcon></KeybindIcon>
            <span className="libro-lab-entry-point-item-config-text">快捷键设置</span>
          </div>
        </Col>
      </Row>
    </div>
  );
});

@singleton()
@view('entry-point-view')
export class EntryPointView extends BaseView {
  override view = EntryPointComponent;
}
