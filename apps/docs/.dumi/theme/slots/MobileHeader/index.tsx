import { GithubOutlined } from '@ant-design/icons';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { ThemeService, useInject } from '@difizen/mana-app';
import { l10n, L10nLang } from '@difizen/mana-l10n';
import { Button } from 'antd';
import { useRouteMeta, Link, usePrefersColor, useSiteData, history} from 'dumi';
import type { SocialTypes } from 'dumi/dist/client/theme-api/types.js';
import HeaderExtra from 'dumi/theme/slots/HeaderExtra';
import Navbar from 'dumi/theme/slots/Navbar';
import SearchBar from 'dumi/theme/slots/SearchBar';
import SocialIcon from 'dumi/theme/slots/SocialIcon';
import React, { useEffect, useMemo, useState } from 'react';

import { Github } from '../../modules/github.js';

import './default.less';
import './index.less';

const MobileHeader: React.FC = () => {
  const { frontmatter } = useRouteMeta();
  const [showMenu, setShowMenu] = useState(false);
  const { themeConfig } = useSiteData();
  const [stars, setStars] = useState<number | undefined>(undefined);
  const github = useInject<Github>(Github);
  const theme = useInject<ThemeService>(ThemeService);
  const currentTheme = theme.getCurrentTheme();

  const {
    prefersColor: { default: defaultColor },
    gitRepo,
  } = themeConfig;
  const [, prefersColor = defaultColor, setPrefersColor] = usePrefersColor();

  useEffect(() => {
    const currentLang = l10n.getLang();
    const urlPath = window.location.pathname;
    const urlLang = urlPath.startsWith(`/${L10nLang.zhCN}`)
      ? L10nLang.zhCN
      : L10nLang.enUS;
    if (currentLang !== urlLang) {
      const newUrl =
        currentLang === L10nLang.enUS
          ? urlPath.replace(`/${urlLang}`, '')
          : `/${currentLang}${urlPath}`;
      history.push({
        pathname: newUrl ? newUrl : '/',
      });
    }
  }, []);

  useEffect(() => {
    if (prefersColor !== currentTheme.type) {
      setPrefersColor(currentTheme.type);
    }
  }, [currentTheme.type, prefersColor, setPrefersColor]);

  useEffect(() => {
    github
      .getRepoStars(gitRepo.owner, gitRepo.name)
      .then((currentStars: number) => {
        return setStars(currentStars);
      })
      .catch(console.error);
  }, [gitRepo.name, gitRepo.owner, github]);

  const socialIcons = useMemo(
    () =>
      themeConfig.socialLinks
        ? Object.keys(themeConfig.socialLinks)
            .slice(0, 5)
            .map((key) => ({
              icon: key as SocialTypes,
              link: themeConfig.socialLinks[key as SocialTypes],
            }))
        : [],
    [themeConfig.socialLinks],
  );

  return (
    <div
      className="dumi-default-header difizen-dumi-mobile-header"
      data-static={Boolean(frontmatter.hero) || undefined}
      data-mobile-active={showMenu || undefined}
      onClick={() => setShowMenu(false)} style={{ paddingTop: '10px' }}
    >
      <div className="dumi-default-header-content">
        <section className="dumi-default-header-left difizen-dumi-header-left">
          <div className="difizen-dumi-header-logo">
            {themeConfig.logo && (
              <Link to={themeConfig['link']}>
                <img className="difizen-dumi-header-logo-img" src={themeConfig.logo} />
              </Link>
            )}
          </div>
        </section>
        <section className="dumi-default-header-right difizen-dumi-header-right">
          <Navbar />
          <div className="dumi-default-header-right-aside">
            <SearchBar />
            <Button
              type="text"
              onClick={() => {
                const urlPath = window.location.pathname;
                const currentLang = l10n.getLang();
                let baseUrlPath = urlPath.startsWith(`/${currentLang}`)
                  ? urlPath.replace(`/${currentLang}`, '')
                  : urlPath;
                baseUrlPath = baseUrlPath ? baseUrlPath : '/';
                const targetLang =
                  currentLang === L10nLang.zhCN ? L10nLang.enUS : L10nLang.zhCN;

                l10n.changeLang(targetLang);

                history.push({
                  pathname:
                    targetLang === L10nLang.enUS
                      ? baseUrlPath
                      : `/${targetLang}${baseUrlPath}`,
                });
              }}
            >
              {l10n.getLang() === L10nLang.zhCN ? 'EN' : '中文'}
            </Button>

            {socialIcons.map((item) => (
              <SocialIcon icon={item.icon} link={item.link} key={item.link} />
            ))}
            <Button
              type="link"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/difizen/libro"
              className="difizen-dumi-header-right-github-btn"
              icon={<GithubOutlined />}
            >
              <div className="difizen-dumi-header-right-github-star">
                <span className="difizen-dumi-header-right-github-btn-hint">Stars</span>
                <div style={{ color: 'rgb(66 78 102 / 100%)', fontSize: 16 }}>
                  {stars || 0}
                </div>
              </div>
            </Button>
            <HeaderExtra />
          </div>
          <button
            type="button"
            className="dumi-default-header-menu-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setShowMenu((v) => !v);
            }}
          >
            {showMenu ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </section>
      </div>
    </div>
  );
};

export default MobileHeader;