import { singleton, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { forwardRef } from 'react';

import { WelcomeIcon } from './welcome-icon.js';

import './index.less';

export const WelcomeComponent = forwardRef(function WelcomeComponent() {
  return (
    <div className="libro-lab-welcome-page">
      <div className="libro-lab-welcome-page-title">欢迎使用 Notebook 工作台 🎉🎉</div>
      <div className="libro-lab-welcome-page-title-tip">
        👋 你好，服务正在加载中，请稍后开启你的研发之旅吧～
      </div>
    </div>
  );
});

@singleton()
@view('welcome-view')
export class WelcomeView extends BaseView {
  override view = WelcomeComponent;

  constructor() {
    super();
    this.title.icon = <WelcomeIcon />;
    this.title.label = '欢迎使用';
  }
}
