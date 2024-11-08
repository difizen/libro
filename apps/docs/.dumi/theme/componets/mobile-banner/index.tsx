import { l10n } from '@difizen/mana-l10n';
import React from 'react';

import type { FeatureProps} from './constants.js';
import { FeatureSection } from './feature-section.js';
import { HeroSection } from './hero-section.js';
import './index.less';

const MobileBanner: React.FC = () => {
  const secondfeatures: FeatureProps[] = [
    {
      title: 'AI Copilot',
      description: l10n.t('AI programming assistant to help your notebook experience~'),
      imageUrl:
        '/copilot.png',
      isImageLeft: true,
    },
    {
      title: l10n.t('Notebook as an App'),
      description: l10n.t('Generate data reports based on notebooks～'),
      imageUrl:
        '/app.png',
      isImageLeft: false,
    },
    {
      title: l10n.t('QuantExpert'),
      description: l10n.t('Intelligent code generation for quantified scenarios~'),
      imageUrl:
        '/diff.png',
      isImageLeft: true,
    }
  ];
  return (
    <div className="difizen-dumi-banner">
      <HeroSection></HeroSection>
      <FeatureSection
        features={secondfeatures}
        title={l10n.t('Exciting features and capabilities')}
      ></FeatureSection>
    </div>
  );
};

export default MobileBanner;
