import { BaseView, view, ViewInstance } from '@difizen/mana-app';
import { singleton, inject } from '@difizen/mana-app';
import { prop, useInject } from '@difizen/mana-app';
import { ThemeService } from '@difizen/mana-app';
import type { Theme } from '@difizen/mana-app';
import { Select } from 'antd';
import * as React from 'react';

import styles from './index.module.less';

export const ThemeSelect: React.ForwardRefExoticComponent<any> = React.forwardRef(
  function ThemeSelect(props, ref: React.ForwardedRef<HTMLDivElement>) {
    const viewInstance = useInject<ThemeSelectView>(ViewInstance);
    return (
      <div ref={ref}>
        <Select
          className={styles.themeSelect}
          size="small"
          value={viewInstance.currentTheme.id}
          onChange={(val) => viewInstance.changeCurrentTheme(val)}
        >
          {viewInstance.themes.map((theme) => (
            <Select.Option value={theme.id} key={theme.id}>
              {theme.label}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  },
);

@singleton()
@view('theme-select')
export class ThemeSelectView extends BaseView {
  override view = ThemeSelect;

  @prop()
  public currentTheme: Theme;

  @prop()
  public themes: Theme[] = [];

  protected readonly themeService: ThemeService;

  constructor(
    @inject(ThemeService)
    themeService: ThemeService,
  ) {
    super();
    this.themeService = themeService;
    this.themes = themeService.getThemes();
    this.currentTheme = themeService.getCurrentTheme();
  }

  changeCurrentTheme(themeId: string) {
    const theme = this.themes.find((item) => item.id === themeId);
    if (theme) {
      this.themeService.setCurrentTheme(themeId);
      this.currentTheme = theme;
    }
  }
}
