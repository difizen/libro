import { l10n } from '@difizen/libro-common/l10n';
import React from 'react';

import { IS_MOBILE } from '../../layouts/DocLayout.js';

import type { FeatureProps} from './constants';
import { FeatureSection } from './feature-section';
import { HeroSection } from './hero-section';
import './index.less';
import { IntergractionSection } from './intergration';

const Banner: React.FC = () => {
  const isMobile = localStorage.getItem(IS_MOBILE) === 'true';

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

  const mobileSecondfeatures: FeatureProps[] = [
    {
      title: 'AI Copilot',
      description: l10n.t('AI programming assistant to help your notebook experience~'),
      url: '/libroai',
      isImageLeft: true,
    },
    {
      title: l10n.t('Notebook as an App'),
      description: l10n.t('Generate data reports based on notebooks～'),
      url: '/datareport',
      isImageLeft: false,
    },
    {
      title: l10n.t('QuantExpert'),
      description: l10n.t('Intelligent code generation for quantified scenarios~'),
      url: '/quantexport',
      isImageLeft: true,
    }
  ];

  const secondfeatures: FeatureProps[] = [
    {
      title: 'AI Copilot',
      description: l10n.t('Support intelligent assistant AI dialogue functions.'),
      imageUrl:
        `${l10n.getLang()==='en-US'?'/ai_copilot.png':'/ai_copilot_zh.png'}`,
      isImageLeft: true,
    },
    {
      title: l10n.t('Notebook as an App'),
      description: l10n.t('Generate dynamic reports based on Notebooks combined with interactive controls.'),
      imageUrl:
        '/app.png',
      isImageLeft: false,
    },
    {
      title: l10n.t('Version Diff Capability'),
      description: l10n.t('Support cell-level version diff capability for better version management and code review.'),
      imageUrl:
        '/diff.png',
      isImageLeft: true,
    },
    {
      title: l10n.t('Superior code suggestion capabilities'),
      description:
      l10n.t('Libro offers an exceptional editing experience, especially for Python code, providing superior code completion, code suggestions, code formatting, and go-to-definition features.'),
      imageUrl:
        '/tip.png',
      isImageLeft: false,
    },
  ];
  return isMobile ? (
    <div className="difizen-dumi-mobile-banner">
      <HeroSection></HeroSection>
      <FeatureSection
        features={mobileSecondfeatures}
        title={l10n.t('Exciting features and capabilities')}
      ></FeatureSection>
    </div>
  ) : (
    <div className="difizen-dumi-banner">
      <HeroSection></HeroSection>
      <FeatureSection
        features={firstfeatures}
        title={l10n.t('Enterprise-level scenario customization capabilities')}
      ></FeatureSection>
      <FeatureSection
        features={secondfeatures}
        title={l10n.t('Exciting features and capabilities')}
      ></FeatureSection>
      <IntergractionSection></IntergractionSection>
    </div>
  );
};

export default Banner;
