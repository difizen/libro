import {
  NotebookIcon,
  PythonIcon,
  JSONIcon,
  MoreIcon,
  FileCreateModal,
  FileView,
} from '@difizen/libro-jupyter';
import {
  CommandRegistry,
  ModalService,
  singleton,
  useInject,
  view,
  ViewManager,
} from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { Col, Row } from 'antd';
import { forwardRef, useEffect, useState } from 'react';

import { KeybindIcon, PreferenceIcon, TerminalIcon } from '../common/icon.js';
import { MenuCommands } from '../menu/index.js';

import './index.less';

export const EntryPointComponent = forwardRef(function EntryPointComponent() {
  const modalService = useInject(ModalService);
  const viewManager = useInject(ViewManager);
  const commandRegistry = useInject(CommandRegistry);
  const [fileView, setFileView] = useState<FileView>();

  useEffect(() => {
    viewManager
      .getOrCreateView(FileView)
      .then((curfileView) => {
        setFileView(curfileView);
        return;
      })
      .catch(() => {
        //
      });
  }, [viewManager]);

  return (
    <div className="libro-lab-entry-point">
      <div className="libro-lab-entry-point-title">请选择你要创建的文件类型：</div>
      <div className="libro-lab-entry-point-item-title">文件</div>
      <Row>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '32px' }}
        >
          <div
            className="libro-lab-entry-point-item"
            onClick={() => {
              modalService.openModal(FileCreateModal, {
                path: fileView?.model.location?.path.toString() || '/',
                fileType: '.ipynb',
              });
            }}
          >
            <NotebookIcon />
            <span className="libro-lab-entry-point-item-text">Notebook</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '32px' }}
        >
          <div
            className="libro-lab-entry-point-item"
            onClick={() => {
              modalService.openModal(FileCreateModal, {
                path: fileView?.model.location?.path.toString() || '/',
                fileType: '.py',
              });
            }}
          >
            <PythonIcon />
            <span className="libro-lab-entry-point-item-text">Python</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '32px' }}
        >
          <div
            className="libro-lab-entry-point-item"
            onClick={() => {
              modalService.openModal(FileCreateModal, {
                path: fileView?.model.location?.path.toString() || '/',
                fileType: '.json',
              });
            }}
          >
            <JSONIcon />
            <span className="libro-lab-entry-point-item-text">JSON</span>
          </div>
        </Col>
        <Col
          className="gutter-row"
          style={{ paddingLeft: 'unset', paddingRight: '32px' }}
        >
          <div
            className="libro-lab-entry-point-item"
            onClick={() => {
              modalService.openModal(FileCreateModal, {
                path: fileView?.model.location?.path.toString() || '/',
              });
            }}
          >
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
          <div
            className="libro-lab-entry-point-item"
            onClick={() => {
              commandRegistry.executeCommand(MenuCommands.OpenTerminal.id);
            }}
          >
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
