import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
  createFromIconfontCN,
  EllipsisOutlined,
  RightOutlined,
} from '@ant-design/icons';
import type { LibroView } from '@difizen/libro-core';
import { LibroContextKey } from '@difizen/libro-core';
import {
  prop,
  ThemeService,
  useInject,
  useObserve,
  watch,
} from '@difizen/libro-common/app';
import { BaseView, view, ViewInstance } from '@difizen/libro-common/app';
import { inject, transient } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';
import { Button, Checkbox, ConfigProvider, Input, Tag, theme } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { InputRef } from 'antd/es/input';
import classnames from 'classnames';
import { forwardRef, memo, useEffect, useRef } from 'react';

import type { LibroSearchProvider } from './libro-search-provider.js';
import { LibroSearchProviderFactory } from './libro-search-provider.js';
import { LibroSearchUtils } from './libro-search-utils.js';

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/a/font_3381673_65wfctnq7rt.js',
});

export const ReplaceToggle = () => {
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

export const SearchIndex: React.FC = () => {
  const instance = useInject<LibroSearchView>(ViewInstance);
  const currentMatchIndex = useObserve(instance.currentMatchIndex);
  const matchesCount = useObserve(instance.matchesCount);

  if (instance.isSearching) {
    return <>searching...</>;
  }

  return (
    <div className="libro-search-index">
      {instance.matchesCount !== undefined
        ? `${currentMatchIndex ?? '-'}/${matchesCount ?? ' -'}`
        : l10n.t('无结果')}
    </div>
  );
};

export const SearchIndexMemo = memo(SearchIndex);

export const SearchContent = () => {
  const instance = useInject<LibroSearchView>(ViewInstance);
  const findInputRef = useRef<InputRef>(null);
  const themeService = useInject(ThemeService);
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
    <ConfigProvider
      theme={{
        algorithm:
          themeService.getCurrentTheme().type === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
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
                placeholder={l10n.t('搜索')}
                suffix={
                  <span className="libro-search-input-suffix">
                    <IconFont
                      className={classnames({
                        'libro-search-input-suffix-active': instance.caseSensitive,
                      })}
                      onClick={instance.toggleCaseSensitive}
                      type="icon-Aa"
                      title="Match Case"
                    />

                    <IconFont
                      className={classnames({
                        'libro-search-input-suffix-active': instance.useRegex,
                      })}
                      onClick={instance.toggleUseRegex}
                      type="icon-zhengzeshi"
                      title="Use Regular Expression"
                    />
                  </span>
                }
              />
            </td>
            <td className="libro-search-action">
              <SearchIndexMemo />
              <div>
                <Button
                  title="Previous Match"
                  onClick={instance.previous}
                  icon={<ArrowUpOutlined />}
                  size="small"
                />

                <Button
                  title="Next Match"
                  onClick={instance.next}
                  icon={<ArrowDownOutlined />}
                  size="small"
                />

                <Button
                  onClick={instance.toggleSetting}
                  icon={<EllipsisOutlined />}
                  size="small"
                />

                <Button
                  onClick={() => instance.hide()}
                  icon={<CloseOutlined />}
                  size="small"
                />
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
                  placeholder={l10n.t('替换')}
                />
              </td>
              <td className="libro-search-action">
                <div>
                  <Button
                    onClick={instance.replace}
                    icon={<IconFont type="icon-zifuchuantihuan_2" />}
                    size="small"
                    title="Replace"
                  />

                  <Button
                    onClick={instance.replaceAll}
                    icon={<IconFont type="icon-tihuantupian" />}
                    size="small"
                    title="Replace All"
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
                {l10n.t('在 Output 中查找')}
              </Checkbox>
              {instance.replaceVisible && (
                <Tag color="warning">{l10n.t('替换功能不能在 Output 生效')}</Tag>
              )}
            </div>
          )}
        </table>
      </div>
    </ConfigProvider>
  );
};
// TODO: 更改图标
export const SearchComponent = forwardRef<HTMLDivElement>(function SearchComponent(
  props: { top?: number },
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
  @inject(LibroContextKey) contextKey: LibroContextKey;
  @inject(LibroSearchUtils) utils: LibroSearchUtils;
  @inject(LibroSearchProviderFactory) searchProviderFactory: LibroSearchProviderFactory;
  libro?: LibroView;
  @prop() searchProvider?: LibroSearchProvider;
  @prop() searchVisible = false;
  get replaceVisible(): boolean {
    return this.searchProvider?.replaceMode ?? false;
  }
  @prop() settingVisible = false;
  @prop() findStr?: string = undefined;
  @prop() lastSearch?: string = undefined;
  @prop() replaceStr = '';
  @prop() caseSensitive = false;
  @prop() useRegex = false;
  @prop() isSearching = false;
  hasFocus = false;

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

  override onViewMount = () => {
    if (!this.searchProvider && this.libro) {
      this.searchProvider = this.searchProviderFactory({ view: this.libro });
      this.toDispose.push(watch(this.libro.model, 'active', this.onActiveCellChanged));
      this.toDispose.push(
        this.libro.model.onSourceChanged(() => this.onCellsChanged()),
      );
      this.toDispose.push(
        this.libro.model.onCellViewChanged(() => this.onCellsChanged()),
      );
      // search view 失去焦点时依然可以通过esc隐藏search
      this.toDispose.push(
        this.libro.model.onCommandModeChanged((mode) => {
          if (mode) {
            setTimeout(() => {
              if (this.hasFocus === false && this.searchVisible) {
                this.hide(false);
              }
            }, 0);
          }
        }),
      );
    }
  };

  onActiveCellChanged = () => {
    if (this.searchVisible) {
      this.searchProvider?.onActiveCellChanged();
    }
  };

  onCellsChanged = () => {
    if (this.searchVisible) {
      this.searchProvider?.onCellsChanged();
    }
  };

  onViewWillUnmount = async () => {
    await this.searchProvider?.endQuery();
    this.searchProvider?.dispose();
  };

  show = () => {
    this.contextKey.disableCommandMode();
    this.searchVisible = true;
    this.initialQuery();
    this.findInputRef?.current?.focus();
  };
  hide = (focus = true) => {
    this.searchVisible = false;
    this.contextKey.enableCommandMode();
    this.searchProvider?.endQuery();
    if (this.searchProvider) {
      this.searchProvider.replaceMode = false;
    }
    if (focus) {
      this.libro?.focus();
    }
  };

  onFocus = () => {
    this.hasFocus = true;
    this.contextKey.disableCommandMode();
  };

  onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    this.hasFocus = false;
    if (this.libro?.container?.current?.contains(e.relatedTarget)) {
      this.contextKey.enableCommandMode();
    }
  };

  search = async (hightlightNext = true) => {
    if (this.searchProvider) {
      this.lastSearch = this.findStr;
      const query = this.utils.parseQuery(
        this.findStr || '',
        this.caseSensitive,
        this.useRegex,
      );
      if (query) {
        this.isSearching = true;
        await this.searchProvider?.startQuery(query, undefined, hightlightNext);
        this.isSearching = false;
      } else {
        await this.searchProvider?.endQuery();
      }
    }
  };
  toggleReplace = () => {
    if (this.searchProvider) {
      this.searchProvider.replaceMode = !this.replaceVisible;
      this.search(false);
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
    this.search();
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
    }
    this.search(false);
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

  nextMatch = async (reverse: boolean) => {
    if (reverse) {
      await this.searchProvider?.highlightPrevious();
    } else {
      await this.searchProvider?.highlightNext();
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
