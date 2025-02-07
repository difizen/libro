import { GithubFilled } from '@ant-design/icons';
import { singleton, view } from '@difizen/libro-common/app';
import { BaseView } from '@difizen/libro-common/app';
import { forwardRef } from 'react';

export const GithubLinkComponent = forwardRef(function GithubLinkComponent() {
  return (
    <a
      href="https://github.com/difizen/libro"
      target="_blank"
      rel="noreferrer"
      style={{ fontSize: 24 }}
    >
      <GithubFilled />
    </a>
  );
});

@singleton()
@view('github-link')
export class GithubLinkView extends BaseView {
  override view = GithubLinkComponent;
  link = '';
  constructor() {
    super();
  }
}
