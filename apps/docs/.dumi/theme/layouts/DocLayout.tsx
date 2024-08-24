import { ManaComponents } from '@difizen/mana-app';
import { Helmet, useLocation, useSiteData } from 'dumi';
import DefaultLayout from 'dumi/theme-default/layouts/DocLayout';
import React from 'react';

import Banner from '../componets/banner/index.js';
import { DumiPreset } from '../modules/module.js';
import Footer from '../slots/Footer/index.js';
import Header from '../slots/Header/index.js';
import './DocLayout.less';

const HomeLayout: React.FC = () => {
  const { themeConfig } = useSiteData();

  return (
    <div>
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

  return (
    <ManaComponents.Application modules={[DumiPreset]} renderChildren>
      {pathname === '/' ? (
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
