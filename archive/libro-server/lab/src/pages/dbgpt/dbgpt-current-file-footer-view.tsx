import {
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import * as React from 'react';
import './index.less';
import { LibroLabCurrentFileFooterView } from '@difizen/libro-lab';
import { Logo } from './logo.js';
import { Tooltip } from 'antd';

const DbgptCurrentFileFooterComponent = React.forwardRef(function CurrentFileFooterComponent(
  _props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const currentFileFooterView = useInject<LibroLabCurrentFileFooterView>(ViewInstance);
  const label = currentFileFooterView.navigatableView?.title.label;
  return (
    <div className="libro-lab-current-file-footer" ref={ref}>
        <Tooltip title="点击跳转 libro">
          <span onClick={()=>{
              window.open('https://github.com/difizen/libro','_blank')
            }}
            className='libro-dbgpt-footer-logo'
          >
            <Logo/>
          </span>
        </Tooltip>
      <span>{l10n.t('当前文件：')}</span>
      {
        typeof label === 'function'
          ? React.createElement(label) // 如果是 React.FC，调用它
          : label /* 如果是 ReactNode，直接渲染 */
      }
    </div>
  );
});

@singleton()
@view('libro-lab-current-file-footer-view')
export class LibroDbgptLabCurrentFileFooterView extends LibroLabCurrentFileFooterView {
  override view = DbgptCurrentFileFooterComponent;
}
