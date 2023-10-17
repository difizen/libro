import { Helmet, useLocation, useSiteData } from 'dumi';
import DefaultLayout from 'dumi/theme-default/layouts/DocLayout';
import React from 'react';

import Banner from '../componets/banner';
import { Roadmap } from '../componets/roadmap';
import TechCard from '../componets/tech-card';
import Footer from '../slots/Footer';
import Header from '../slots/Header';
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
      <TechCard />
      <Roadmap />
      <Footer />
    </div>
  );
};

const DocLayout = () => {
  const { pathname } = useLocation();

  return (
    <>
      {pathname === '/' ? (
        <HomeLayout />
      ) : (
        <div className="difizen-dumi-layout">
          <DefaultLayout />
        </div>
      )}
    </>
  );
};

export default DocLayout;
