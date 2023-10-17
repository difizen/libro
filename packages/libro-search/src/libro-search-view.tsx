import {
  RightOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EllipsisOutlined,
  CloseOutlined,
  createFromIconfontCN,
} from '@ant-design/icons';
import type { LibroView } from '@difizen/libro-core';
import { LirboContextKey } from '@difizen/libro-core';
import { prop, useInject } from '@difizen/mana-app';
import { BaseView, view, ViewInstance } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Input, Button, Checkbox, Tag } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { InputRef } from 'antd/es/input';
import classnames from 'classnames';
import type { FC } from 'react';
import { forwardRef, useEffect, useRef } from 'react';

import type { LibroSearchProvider } from './libro-search-provider.js';
import { LibroSearchProviderFactory } from './libro-search-provider.js';
import { LibroSearchUtils } from './libro-search-utils.js';

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/a/font_3381673_65wfctnq7rt.js',
});

export const ReplaceToggle: FC = () => {
  const instance = useInject<LibroSearchView>(ViewInstance);
  return (
    <div className="libro-search-replace-toggle" onClick={instance.toggleReplace}>
      <RightOutlined
        className={classnames({
          'libro-search-replace-toggle-icon': true,
          'libro-search-replace-toggle-replace-icon': instance.replaceVisible,
        })}
      />
    </div>
  );
};

export const SearchIndex: FC = () => {
  const instance = useInject<LibroSearchView>(ViewInstance);
  return (
    <div className="libro-search-index">
      {instance.currentMatchIndex ?? '-'}/{instance.matchesCount ?? '-'}
    </div>
  );
};

export const SearchContent: FC = () => {
  const instance = useInject<LibroSearchView>(ViewInstance);
  const findInputRef = useRef<InputRef>(null);
  useEffect(() => {
    if (findInputRef.current) {
      findInputRef.current.focus();
    }
    instance.findInputRef = findInputRef;
    if (instance.container?.current) {
      const container = instance.container.current;
      container.addEventListener('keydown', instance.handleKeydown);
      return () => {
        container.removeEventListener('keydown', instance.handleKeydown);
      };
    }
    return;
  }, [instance]);
  return (
    <div
      className="libro-search-content"
      style={{ height: `${instance.contentHeight}px` }}
    >
      <ReplaceToggle />
      <table className="libro-search-input-area">
        <tr className="libro-search-row">
          <td className="libro-search-input">
            <Input
              ref={findInputRef}
              value={instance.findStr}
              onChange={instance.handleFindChange}
              size="small"
              suffix={
                <span className="libro-search-input-suffix">
                  <IconFont
                    className={classnames({
                      'libro-search-input-suffix-active': instance.caseSensitive,
                    })}
                    onClick={instance.toggleCaseSensitive}
                    type="icon-Aa"
                  />

                  <IconFont
                    className={classnames({
                      'libro-search-input-suffix-active': instance.useRegex,
                    })}
                    onClick={instance.toggleUseRegex}
                    type="icon-zhengzeshi"
                  />
                </span>
              }
            />
          </td>
          <td className="libro-search-action">
            <SearchIndex />
            <div>
              <Button
                onClick={instance.previous}
                icon={<ArrowUpOutlined />}
                size="small"
              />
              <Button
                onClick={instance.next}
                icon={<ArrowDownOutlined />}
                size="small"
              />
              <Button
                onClick={instance.toggleSetting}
                icon={<EllipsisOutlined />}
                size="small"
              />
              <Button onClick={instance.hide} icon={<CloseOutlined />} size="small" />
            </div>
          </td>
        </tr>
        {instance.replaceVisible && (
          <tr className="libro-search-row">
            <td className="libro-search-input">
              <Input
                value={instance.replaceStr}
                onChange={instance.handleReplaceChange}
                size="small"
              />
            </td>
            <td className="libro-search-action">
              <div>
                <Button
                  onClick={instance.replace}
                  icon={<IconFont type="icon-zifuchuantihuan_2" />}
                  size="small"
                />

                <Button
                  onClick={instance.replaceAll}
                  icon={<IconFont type="icon-tihuantupian" />}
                  size="small"
                />
              </div>
            </td>
          </tr>
        )}

        {instance.settingVisible && (
          <div className="libro-search-row">
            <Checkbox
              checked={instance.searchProvider?.searchCellOutput}
              onChange={instance.searchCellOutputChange}
              disabled={instance.replaceVisible}
            >
              {l10n.t('在 output 中查找')}
            </Checkbox>
            {instance.replaceVisible && (
              <Tag color="warning">{l10n.t('替换功能不能在 output 生效')}</Tag>
            )}
          </div>
        )}
      </table>
    </div>
  );
};
// TODO: 更改图标
export const SearchComponent = forwardRef<HTMLDivElement>(function SearchComponent(
  _props: { top?: number },
  ref,
) {
  const instance = useInject<LibroSearchView>(ViewInstance);
  return (
    <div
      tabIndex={1}
      className="libro-search-overlay"
      style={{ top: instance.getHeaderHeight() }}
      ref={ref}
      onBlur={(e) => instance.onBlur(e)}
      onFocus={instance.onFocus}
    >
      {instance.searchVisible && <SearchContent />}
    </div>
  );
});

@transient()
@view('libro-search-view')
export class LibroSearchView extends BaseView {
  findInputRef?: React.RefObject<InputRef> | null;
  contextKey: LirboContextKey;
  utils: LibroSearchUtils;
  searchProviderFactory: LibroSearchProviderFactory;

  constructor(
    @inject(LirboContextKey) contextKey: LirboContextKey,
    @inject(LibroSearchUtils) utils: LibroSearchUtils,
    @inject(LibroSearchProviderFactory)
    searchProviderFactory: LibroSearchProviderFactory,
  ) {
    super();
    this.contextKey = contextKey;
    this.utils = utils;
    this.searchProviderFactory = searchProviderFactory;
  }

  protected _libro?: LibroView;

  get libro(): LibroView | undefined {
    return this._libro;
  }

  set libro(value: LibroView | undefined) {
    this._libro = value;
    this.searchProvider = this.searchProviderFactory({ view: this.libro! });
  }

  @prop() searchProvider?: LibroSearchProvider;
  @prop() searchVisible = false;
  get replaceVisible(): boolean {
    return this.searchProvider?.replaceMode ?? false;
  }
  @prop() settingVisible = false;
  @prop() findStr?: string | undefined = undefined;
  @prop() lastSearch?: string | undefined = undefined;
  @prop() replaceStr = '';
  @prop() caseSensitive = false;
  @prop() useRegex = false;

  override view = SearchComponent;

  get contentHeight() {
    let height = 32;
    if (this.replaceVisible) {
      height += 32;
    }
    if (this.settingVisible) {
      height += 32;
    }
    return height;
  }
  get currentMatchIndex() {
    const current = this.searchProvider?.currentMatchIndex;
    if (current !== undefined) {
      return current + 1;
    }
    return undefined;
  }
  get matchesCount() {
    return this.searchProvider?.matchesCount;
  }

  onviewWillUnmount = () => {
    this.searchProvider?.endQuery();
  };

  show = () => {
    this.contextKey.disableCommandMode();
    this.searchVisible = true;
    this.initialQuery();
    this.findInputRef?.current?.focus();
  };
  hide = () => {
    this.searchVisible = false;
    this.contextKey.enableCommandMode();
    this.searchProvider?.endQuery();
    this.libro?.focus();
  };

  onFocus = () => {
    this.contextKey.disableCommandMode();
  };

  onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (this.libro?.container?.current?.contains(e.relatedTarget)) {
      this.contextKey.enableCommandMode();
    }
  };

  search = (hightlightNext = true) => {
    if (this.searchProvider) {
      this.lastSearch = this.findStr;
      const query = this.utils.parseQuery(
        this.findStr || '',
        this.caseSensitive,
        this.useRegex,
      );
      if (query) {
        this.searchProvider?.startQuery(query, undefined, hightlightNext);
      } else {
        this.searchProvider?.endQuery();
      }
    }
  };
  toggleReplace = () => {
    if (this.searchProvider) {
      this.searchProvider.replaceMode = !this.replaceVisible;
      this.search();
    }
  };

  toggleSetting = () => {
    this.settingVisible = !this.settingVisible;
    this.search();
  };

  toggleCaseSensitive = () => {
    this.caseSensitive = !this.caseSensitive;
    this.search();
  };

  toggleUseRegex = () => {
    this.useRegex = !this.useRegex;
  };

  next = () => {
    this.searchProvider?.highlightNext();
  };

  previous = () => {
    this.searchProvider?.highlightPrevious();
  };

  searchCellOutputChange = (e: CheckboxChangeEvent) => {
    if (this.searchProvider) {
      this.searchProvider.updateSearchCellOutput(e.target.checked);
    }
  };

  replace = () => {
    this.searchProvider?.replaceCurrentMatch(this.replaceStr);
  };
  replaceAll = () => {
    this.searchProvider?.replaceAllMatches(this.replaceStr);
  };
  initialQuery = () => {
    const init = this.searchProvider?.getInitialQuery();
    if (init) {
      this.findStr = init;
      this.search(false);
    }
  };
  getHeaderHeight = () => {
    let height = 32;
    const container = this.libro?.container?.current;
    if (container) {
      const elements = container.getElementsByClassName('libro-view-top');
      if (elements.length > 0) {
        height = elements[0].clientHeight;
      }
    }
    return height;
  };

  nextMatch = (reverse: boolean) => {
    if (reverse) {
      this.searchProvider?.highlightPrevious();
    } else {
      this.searchProvider?.highlightNext();
    }
  };

  handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      this.hide();
      return;
    }
    if (e.key === 'Enter') {
      e.stopPropagation();
      e.preventDefault();
      if (this.findStr !== this.lastSearch) {
        this.search();
        return;
      }
      if (this.matchesCount !== undefined && this.matchesCount > 0) {
        this.nextMatch(e.shiftKey);
      } else {
        this.search();
      }
      return;
    }
  };

  protected doHandleFindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.findStr = e.target.value;
  };

  handleFindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.findStr = e.target.value;
    if (this.findStr !== this.lastSearch) {
      this.search(false);
    }
  };
  handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.replaceStr = e.target.value;
  };
}
