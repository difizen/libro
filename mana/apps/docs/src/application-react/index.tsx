import { ManaComponents } from '@difizen/mana-app';
import { ManaAppPreset, Loading } from '@difizen/mana-app';
import { langBundles, l10n, L10nLang } from '@difizen/mana-l10n';

import { AntdMenuModule } from './antd-menu/index.js';
import { CommandPalette } from './command-palette/index.js';
import { ContentModule } from './content/index.js';
import { FileModule } from './file/index.js';
import styles from './index.module.less';
import { LogoModule } from './logo/index.js';
import { ConfigurtionMenuModule } from './setting-editor/index.js';
import { ThemeSwitcherModule } from './theme-switcher/index.js';
import { UerModule } from './user/index.js';
import { WorkbenchModule } from './workbench/index.js';

l10n.loadLangBundles(langBundles);
l10n.changeLang(L10nLang.enUS);

export default function App(): JSX.Element {
  return (
    <div className={styles.appContainer}>
      <ManaComponents.Application
        asChild={true}
        modules={[
          ManaAppPreset,
          FileModule,
          WorkbenchModule,
          AntdMenuModule,
          ContentModule,
          ConfigurtionMenuModule,
          LogoModule,
          UerModule,
          CommandPalette,
          ThemeSwitcherModule,
        ]}
        loading={<Loading />}
      />
    </div>
  );
}
