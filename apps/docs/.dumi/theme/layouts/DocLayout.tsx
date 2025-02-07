import { ManaComponents } from '@difizen/libro-common/app';
import { Helmet, useLocation, useSiteData } from 'dumi';
import DefaultLayout from 'dumi/theme-default/layouts/DocLayout';
import React, { useEffect } from 'react';

import Banner from '../componets/banner/index.js';
import { DumiPreset } from '../modules/module.js';
import Footer from '../slots/Footer/index.js';
import Header from '../slots/Header/index.js';
import './DocLayout.less';
import '../tailwind.out.css';

export const IS_MOBILE = 'IS_MOBILE';

const HomeLayout: React.FC = () => {
  const { themeConfig } = useSiteData();

  return (
    <div className="difizen-home-layout">
      <Helmet>
        <title>{themeConfig.name}</title>
      </Helmet>
      <Header />
      <Banner />
      <Footer />
    </div>
  );
};

const DocLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const u = navigator.userAgent;
    if (!!u.match(/iphone/i) || u.match(/android/i)) {
      localStorage.setItem(IS_MOBILE, 'true');
    } else {
      localStorage.setItem(IS_MOBILE, 'false');
    }
  }, []);

  return (
    <ManaComponents.Application modules={[DumiPreset]} renderChildren>
      {pathname === '/'||pathname === '/zh-CN'||pathname === '/zh-CN/' ? (
          <HomeLayout />
      ) : (
        <div className="difizen-dumi-layout">
          <DefaultLayout />
        </div>
      )}
    </ManaComponents.Application>
  );
};

export default DocLayout;
