import type { FeatureProps } from './constants.js';
import { l10n } from '@difizen/mana-l10n';
import { Button } from 'antd';
import type { FC } from 'react';
import React from 'react';

const Feature: FC<FeatureProps> = ({ title, description, isImageLeft }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-center">
    <div className={`order-2 ${isImageLeft ? 'md:order-2' : 'md:order-1'}`} style={{textAlign: `${isImageLeft ? 'left' : 'right'}`}}>
      <h3 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        {title}
      </h3>
      <p className="mt-4 text-base leading-8 text-muted-foreground">{description}</p>
      <div className="mt-4">
        <Button type="primary" size="large" className="start-btn"
                href="http://libro-lab.difizen.net/libro?" target="_blank">
          {l10n.t('Click to jump')}
        </Button>
      </div>
    </div>
  </div>
);

export const FeatureSection: FC<{
  features: FeatureProps[];
  title: string;
}> = ({ features }) => {
  return (
    <div className="px-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <div className="mt-8 flex flex-col gap-16">
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};
