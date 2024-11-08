import { ManaComponents } from '@difizen/mana-app';
import { Helmet, useLocation, useSiteData } from 'dumi';
import DefaultLayout from 'dumi/theme-default/layouts/DocLayout';
import React, { useEffect, useState } from 'react';

import Banner from '../componets/banner/index.js';
import Footer from '../slots/Footer/index.js';
import Header from '../slots/Header/index.js';
import './DocLayout.less';
import '../tailwind.out.css';
import MobileHeader from '../slots/MobileHeader/index.js';
import MobileFooter from '../slots/MobileFooter/index.js';
import MobileBanner from '../componets/mobile-banner/index.js';
import { DumiPreset } from '../modules/module.js';

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

const MobileHomeLayout: React.FC = () => {
  const { themeConfig } = useSiteData();

  return (
    <div className="difizen-home-layout">
      <Helmet>
        <title>{themeConfig.name}</title>
      </Helmet>
      <MobileHeader />
      <MobileBanner />
      <MobileFooter />
    </div>
  );
};

const DocLayout = () => {
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const u = navigator.userAgent;
    if (!!u.match(/iphone/i) || u.match(/android/i)) {
      setIsMobile(true);
    }
  }, []);

  return (
    <ManaComponents.Application modules={[DumiPreset]} renderChildren>
      {pathname === '/'||pathname === '/zh-CN'||pathname === '/zh-CN/' ? (
        isMobile ? <MobileHomeLayout /> : <HomeLayout />
      ) : (
        <div className="difizen-dumi-layout">
          <DefaultLayout />
        </div>
      )}
    </ManaComponents.Application>
  );
};

export default DocLayout;
