import { useSiteData } from 'dumi';
import React from 'react';

import { firstfeatures, secondfeatures } from './constants';
import { FeatureSection } from './feature-section';
import { HeroSection } from './hero-section';
import './index.less';
import { IntergractionSection } from './intergration';

const Banner: React.FC = () => {
  const { themeConfig } = useSiteData();

  if (!themeConfig.banner) {
    return null;
  }
  return (
    <div className="difizen-dumi-banner">
      <HeroSection></HeroSection>
      <FeatureSection
        features={firstfeatures}
        title="企业级场景定制能力"
      ></FeatureSection>
      <FeatureSection
        features={secondfeatures}
        title="激动人心的功能特性"
      ></FeatureSection>
      <IntergractionSection></IntergractionSection>
    </div>
  );
};

export default Banner;
