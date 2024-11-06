import type { FC } from 'react';
import React from 'react';

import type { FeatureProps } from './constants';
import { l10n } from '@difizen/mana-l10n';
import { Button } from 'antd';

const Feature: FC<FeatureProps> = ({ title, description, imageUrl, isImageLeft }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-center">
    {/*{isImageLeft && (*/}
    {/*  <div className="order-1 md:order-1">*/}
    {/*    <img*/}
    {/*      className="w-full max-w-2xl rounded-xl shadow-xl ring-1 ring-gray-400/10"*/}
    {/*      src={imageUrl}*/}
    {/*      alt={title}*/}
    {/*    />*/}
    {/*  </div>*/}
    {/*)}*/}
    <div className={`order-2 ${isImageLeft ? 'md:order-2' : 'md:order-1'}`} style={{textAlign: `${isImageLeft ? 'left' : 'right'}`}}>
      <h3 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        {title}
      </h3>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">{description}</p>
      <div className="mt-4">
        <Button type="primary" size="large" className="start-btn"
                href="http://libro-lab.difizen.net/libro?" target="_blank">
          {l10n.t('Click to jump')}
        </Button>
      </div>
    </div>
    {/*{!isImageLeft && (*/}
    {/*  <div className="order-1 md:order-2">*/}
    {/*    <img*/}
    {/*      className="w-full max-w-2xl rounded-xl shadow-xl ring-1 ring-gray-400/10"*/}
    {/*      src={imageUrl}*/}
    {/*      alt={title}*/}
    {/*    />*/}
    {/*  </div>*/}
    {/*)}*/}
  </div>
);

export const FeatureSection: FC<{
  features: FeatureProps[];
  title: string;
}> = ({ features, title }) => {
  return (
    <div className="px-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      {/*<div className="mx-auto max-w-2xl text-center mb-16">*/}
      {/*  <p className="feature-title">{title}</p>*/}
      {/*</div>*/}
      <div className="mt-8 flex flex-col gap-16">
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </div>

      {/*<h5*/}
      {/*  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary mb-6 drop-shadow-md">*/}
      {/*  AI Copiot*/}
      {/*</h5>*/}
      {/*<p className="text-xl sm:text-2xl text-muted-foreground mb-8">*/}
      {/*  {l10n.t('AI programming assistant to help your notebook experience~')}*/}
      {/*</p>*/}

    </div>
  );
};
