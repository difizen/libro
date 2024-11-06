import { l10n } from '@difizen/mana-l10n';
import React from 'react';

import type { FeatureProps} from './constants';
import { FeatureSection } from './feature-section';
import { HeroSection } from './hero-section';
import './index.less';

const Banner: React.FC = () => {


  const firstfeatures: FeatureProps[] = [
    {
      title: l10n.t('Multi-node debugging in secret computing scenarios.'),//'隐私计算场景多节点调试',
      description:
        l10n.t(`SecretNote is an advanced tool suite designed specifically for Enigma developers. It supports multi-node code execution and file management, while also providing runtime status tracking features, significantly enhancing developer's efficiency and work experience.`),
      imageUrl:
        '/scretenote.png',
      isImageLeft: true,
    },
    {
      title: l10n.t('Intelligent code generation for quantitative scenarios.'),
      description:l10n.t('In the coding environment most comfortable for quantitative analysts, seamlessly integrate large model ecosystems and custom agents through Prompt Cell.'),
      imageUrl:
        '/zhu.png',
      isImageLeft: false,
    },
    {
      title: l10n.t('Big Data SQL Interaction Enhancement'),
      description: l10n.t('Provide powerful kernel customization capabilities, supporting execution environments like ODPS SQL.'),
      imageUrl:
        '/sql_ide.png',
      isImageLeft: true,
    },
  ];


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
      {/*<FeatureSection*/}
      {/*  features={firstfeatures}*/}
      {/*  title={l10n.t('Enterprise-level scenario customization capabilities')}*/}
      {/*></FeatureSection>*/}
      <FeatureSection
        features={secondfeatures}
        title={l10n.t('Exciting features and capabilities')}
      ></FeatureSection>
      {/*<IntergractionSection></IntergractionSection>*/}
    </div>
  );
};

export default Banner;
