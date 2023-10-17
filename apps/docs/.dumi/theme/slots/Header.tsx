import { Link, useLocation, useNavData, useSiteData } from 'dumi';
import React from 'react';

import SearchBar from '../componets/search-bar';
import useScroll from '../hooks/useScroll.js';
import './Header.less';

const NavBar: React.FC = () => {
  const nav = useNavData();
  const { pathname } = useLocation();
  const activeKey = `/${pathname.split('/')?.[1]}`;
  return (
    <div>
      {nav.map((it) => (
        <Link
          to={it.link}
          key={`${it.title}-${it.link}`}
          style={{
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              textDecoration: 'none',
              color:
                activeKey === it.link ? 'rgb(22, 119, 255)' : 'rgba(0, 0, 0, 0.88)',
              margin: '0 16px',
            }}
          >
            {it.title}
          </span>
        </Link>
      ))}
    </div>
  );
};

const Header: React.FC = () => {
  const scroll = useScroll();
  const { themeConfig } = useSiteData();

  return (
    <nav
      className="difizen-dumi-header"
      style={{
        background: scroll > 70 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0)',
      }}
    >
      <div className="difizen-dumi-header-logo">
        {themeConfig.logo && (
          <Link
            style={{
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 22,
              alignItems: 'center',
              display: 'inline-flex',
              marginRight: 32,
              color: '#30363f',
            }}
            to={themeConfig['link']}
          >
            <img className="difizen-dumi-header-logo-img" src={themeConfig.logo} />
            {themeConfig.name}
          </Link>
        )}
      </div>
      <NavBar />

      <div className="difizen-dumi-header-right">
        <SearchBar />
        {/* TODO 目前fork和stars是写死的，等后续采用接口 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a
            href="https://github.com/difizen/libro"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <div className="difizen-dumi-header-right-github-btn">
              <span className="difizen-dumi-header-right-github-btn-hint">Forks</span>
              <div style={{ color: 'rgb(66 78 102 / 100%)' }}>
                {themeConfig['githubInfo']?.forks || 0}
              </div>
            </div>
          </a>
          <a
            href="https://github.com/difizen/libro"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <div className="difizen-dumi-header-right-github-btn">
              <span className="difizen-dumi-header-right-github-btn-hint">Stars</span>
              <div style={{ color: 'rgb(66 78 102 / 100%)' }}>
                {themeConfig['githubInfo']?.stars || 0}
              </div>
            </div>
          </a>
          <a target="_blank" href={themeConfig['githubInfo']?.url} rel="noreferrer">
            <img
              className="difizen-dumi-header-right-github-logo"
              src="https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*Ybx5RKAUMbUAAAAAAAAAAAAADo6HAQ/original"
            />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Header;
