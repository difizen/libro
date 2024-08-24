import { GithubOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { ThemeService, useInject } from '@difizen/mana-app';
import { Button } from 'antd';
import { useRouteMeta, Link, usePrefersColor, useSiteData } from 'dumi';
import type { SocialTypes } from 'dumi/dist/client/theme-api/types.js';
import HeaderExtra from 'dumi/theme/slots/HeaderExtra';
import Navbar from 'dumi/theme/slots/Navbar';
import SearchBar from 'dumi/theme/slots/SearchBar';
import SocialIcon from 'dumi/theme/slots/SocialIcon';
import React, { useEffect, useMemo, useState } from 'react';

import { Github } from '../../modules/github.js';

import './default.less';
import './index.less';

const Header: React.FC = () => {
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
      className="dumi-default-header difizen-dumi-header"
      data-static={Boolean(frontmatter.hero) || undefined}
      data-mobile-active={showMenu || undefined}
      onClick={() => setShowMenu(false)}
    >
      <div className="dumi-default-header-content">
        <section className="dumi-default-header-left difizen-dumi-header-left">
          <div className="difizen-dumi-header-logo">
            {themeConfig.logo && (
              <Link to={themeConfig['link']}>
                <img className="difizen-dumi-header-logo-img" src={themeConfig.logo} />
                {themeConfig.name}
              </Link>
            )}
          </div>
        </section>
        <section className="dumi-default-header-right difizen-dumi-header-right">
          <Navbar />
          <div className="dumi-default-header-right-aside">
            <SearchBar />
            {themeConfig.prefersColor.switch && (
              <Button
                type="text"
                onClick={() => {
                  const target = prefersColor === 'light' ? 'dark' : 'light';
                  theme.setCurrentTheme(target);
                }}
                icon={prefersColor === 'light' ? <SunOutlined /> : <MoonOutlined />}
              ></Button>
            )}
            {socialIcons.map((item) => (
              <SocialIcon icon={item.icon} link={item.link} key={item.link} />
            ))}
            <Button
              type="link"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/difizen/mana"
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

export default Header;
