import { l10n } from '@difizen/mana-l10n';
import { Button } from 'antd';
import { history } from 'dumi';
import type { FC } from 'react';
import { IS_MOBILE } from '../../layouts/DocLayout.js';
import type { FeatureProps } from './constants';

const Feature: FC<FeatureProps> = ({ title, description, imageUrl, url, isImageLeft }) => {
  const isMobile = localStorage.getItem(IS_MOBILE) === 'true';

  return isMobile ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-center">
    <div className={`order-2 ${isImageLeft ? 'md:order-2' : 'md:order-1'}`}
         style={{ textAlign: `${isImageLeft ? 'left' : 'right'}` }}>
      <h3 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        {title}
      </h3>
      <p className="mt-4 text-base leading-8 text-muted-foreground">{description}</p>
      <div className="mt-4">
        <Button type="primary" size="large" className="start-btn" onClick={() => history.push({ pathname: url}) }>
          {l10n.t('Click to jump')}
        </Button>
      </div>
    </div>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-center">
    {isImageLeft && (
      <div className="order-1 md:order-1">
        <img
          className="w-full max-w-2xl rounded-xl shadow-xl ring-1 ring-gray-400/10"
          src={imageUrl}
          alt={title}
        />
      </div>
    )}
    <div className={`order-2 ${isImageLeft ? 'md:order-2' : 'md:order-1'}`}>
      <h3 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        {title}
      </h3>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">{description}</p>
    </div>
    {!isImageLeft && (
      <div className="order-1 md:order-2">
        <img
          className="w-full max-w-2xl rounded-xl shadow-xl ring-1 ring-gray-400/10"
          src={imageUrl}
          alt={title}
        />
      </div>
    )}
  </div>
)};

export const FeatureSection: FC<{
  features: FeatureProps[];
  title: string;
}> = ({ features, title }) => {
  const isMobile = localStorage.getItem(IS_MOBILE) === 'true';
  return isMobile ? (
    <div className="px-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <div className="mt-8 flex flex-col gap-16">
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </div>
    </div>
  ) : (
    <div className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <div className="mx-auto max-w-2xl text-center mb-16">
        <p className="feature-title">{title}</p>
      </div>
      <div className="mt-8 flex flex-col gap-16">
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};
